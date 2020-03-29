const express = require('express');
const app = express();
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
var mysql = require('mysql');
var JSONbig = require('json-bigint');

var con = mysql.createConnection({
    host: "emuladder.clannzsjouuv.us-east-1.rds.amazonaws.com",
    user: "emuLadder",
    password: "whatisourpassword",
    port: 3306,
    database: 'emuladder',
    supportBigNumbers : true
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

class EventDetails {

    async notAClue(headers) {

        //Select all games that have a state of 3 and then run through them..... 
        let sql = "SELECT * FROM Events WHERE Events.currentState = 3";
        con.query(sql, async function (err, result) {
            if (err) throw err;
            //console.log(result);
            console.log(result[0].eventId);
            
            for(let i = 0; i < result.length; i++){
                const api_url = 'https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id='.concat(result[i].eventId);
                console.log(result[i].eventId + " Here");
                const response = await fetch(api_url, { method: 'GET', headers: headers });
                const eventDetailsJson = await response.json();
                var eventDetailsParsedJson = JSONbig.parse(JSONbig.stringify(eventDetailsJson));
                var gameId = BigInt(eventDetailsParsedJson.data.event.match.games[0].id);
                console.log(gameId + " Here " + i);
                
                //Can now use the gameId to go in and get the match details... first have to map the playerId's with the participantId(Number) which is used to reference to each player instead of the playerId for the duration of the game....
                const windowApi_url = 'https://feed.lolesports.com/livestats/v1/window/'.concat(BigInt(gameId));
                const windowResponse = await fetch(windowApi_url, { method: 'GET', headers: headers });
                const windowText = await windowResponse.text();
                if(windowText.length > 1){
                    const windowJson = await JSON.parse(windowText);
                    var windowParsedJson = JSON.parse(JSON.stringify(windowJson));

                    console.log(windowParsedJson);

                    var blueTeamParticipantData = windowParsedJson.gameMetadata.blueTeamMetadata.participantMetadata;
                    var redTeamParticipantData = windowParsedJson.gameMetadata.redTeamMetadata.participantMetadata;

                    var values = [];

                    for (let j = 0; j < blueTeamParticipantData.length; j++) {
                        var teamId = windowParsedJson.gameMetadata.blueTeamMetadata.esportsTeamId;
                        console.log("teamId " + teamId);
                        var participantNumber = blueTeamParticipantData[j].participantId;
                        var esportsPlayerId = blueTeamParticipantData[j].esportsPlayerId;
                        console.log("participantId " + participantNumber + " esportPlayerId " + esportsPlayerId);

                        let arrayOfValues = [];
                        arrayOfValues.push(result[i].eventId, gameId, teamId, esportsPlayerId, participantNumber);
                        values.push(arrayOfValues);
                    }
                    for (let k = 0; k < redTeamParticipantData.length; k++) {
                        var teamId = windowParsedJson.gameMetadata.redTeamMetadata.esportsTeamId;
                        console.log("teamId " + teamId);
                        var participantNumber = redTeamParticipantData[k].participantId;
                        var esportsPlayerId = redTeamParticipantData[k].esportsPlayerId;
                        console.log("participantId " + participantNumber + " esportPlayerId " + esportsPlayerId);

                        let arrayOfValuess = [];
                        arrayOfValuess.push(result[i].eventId, gameId, teamId, esportsPlayerId, participantNumber);
                        values.push(arrayOfValuess);
                    }

                    //Commented out for the time being as I didn't want to insert to the DB every time I was making changes and testing... 
                    var inc = 0;
                    if (values.length > 0) {
                        //query to insert a batch into EventPoints Table.
                        var sql = "INSERT INTO EventPoints (eventId, matchId, teamId, playerId, participantNumber) VALUES ?";
                        con.query(sql, [values], function (err, result) {
                            if (err) throw err;
                            console.log("1 record inserted, total: " + (++inc));
                        });
                    }

                    //Start new work here filling out the League Stats Datatable...
                    var frameInfo = windowParsedJson.frames;
                    var frameInfoLength = frameInfo.length - 1;
                    var pausedInc = 10;
                    var loopingInc = 0;

                    while (frameInfo[frameInfoLength].gameState != "finished") {
                        console.log(frameInfoLength + " len");
                        var frameTimestamp = frameInfo[frameInfoLength].rfc460Timestamp;
                        var dateObj = new Date(frameTimestamp);
                        console.log(dateObj.toISOString() + " FirstTime" + " GameID: " + gameId);
                        if(gameId == gameId){
                            loopingInc++;
                        }
                        if(loopingInc > 4){
                            console.log(" ");
                            console.log("Game doesn't have Finished State... Breaking out of loop and moving to next game.");
                            console.log(" ");
                            break;
                        }
                        if ((dateObj.getSeconds() % 10) != 0) {
                            var remainder = 10 - (dateObj.getSeconds() % 10);
                            console.log(remainder);
                            dateObj.setSeconds(dateObj.getSeconds() + remainder);
                        }

                        if (frameInfo[frameInfoLength].gameState == "paused") {
                            console.log("IN PAUSED")
                            dateObj.setSeconds(dateObj.getSeconds() + pausedInc);
                            pausedInc += 10;
                        } else {
                            pausedInc = 10;
                        }

                        dateObj.setMinutes(dateObj.getMinutes() + 30);
                        var test = dateObj.toISOString().split('.')[0] + "Z";
                        console.log(test + " SecondTime")
                        const swindowApi_url = 'https://feed.lolesports.com/livestats/v1/window/'.concat(gameId + "?startingTime=" + test);
                        const swindowResponse = await fetch(swindowApi_url, { method: 'GET', headers: headers });
                        const swindowJson = await swindowResponse.json();
                        var swindowParsedJson = JSON.parse(JSON.stringify(swindowJson));

                        frameInfo = swindowParsedJson.frames;
                        frameInfoLength = swindowParsedJson.frames.length - 1;
                        console.log(frameInfoLength + " len");
                    }

                    console.log(frameInfo[frameInfoLength].gameState + " SUCCESFULLY PARSED");
                    var blueTeamFinishedStateMetaData = frameInfo[frameInfoLength].blueTeam;
                    var blueTeamTurrets = blueTeamFinishedStateMetaData.towers;
                    var blueTeamDragons = blueTeamFinishedStateMetaData.dragons.length;
                    var blueTeamBarons = blueTeamFinishedStateMetaData.barons;
                    var redTeamFinishedStateMetaData = frameInfo[frameInfoLength].redTeam;
                    var redTeamTurrets = redTeamFinishedStateMetaData.towers;
                    var redTeamDragons = redTeamFinishedStateMetaData.dragons.length;
                    var redTeamBarons = redTeamFinishedStateMetaData.barons;

                    var leagueStats = [];
                    var blueParticipant = blueTeamFinishedStateMetaData.participants;
                    var redParticipant = redTeamFinishedStateMetaData.participants;
                    for(let l = 0; l < 5; l++){
                        var blueTeamId = windowParsedJson.gameMetadata.blueTeamMetadata.esportsTeamId;
                        var blueParticipantId = blueParticipant[l].participantId;
                        var blueKills = blueParticipant[l].kills;
                        var blueDeaths = blueParticipant[l].deaths;
                        var blueAssists = blueParticipant[l].assists;
                        var blueCreepScore = blueParticipant[l].creepScore;

                        let arrayOfValuesBlue = [];
                        arrayOfValuesBlue.push(gameId, blueParticipantId, blueKills, blueDeaths, blueAssists, blueCreepScore, blueTeamId, blueTeamTurrets, blueTeamDragons, blueTeamBarons);
                        leagueStats.push(arrayOfValuesBlue);

                        var redTeamId = windowParsedJson.gameMetadata.redTeamMetadata.esportsTeamId;
                        var redParticipantId = redParticipant[l].participantId;
                        var redKills = redParticipant[l].kills;
                        var redDeaths = redParticipant[l].deaths;
                        var redAssists = redParticipant[l].assists;
                        var redCreepScore = redParticipant[l].creepScore;

                        let arrayOfValuesRed = [];
                        arrayOfValuesRed.push(gameId, redParticipantId, redKills, redDeaths, redAssists, redCreepScore, redTeamId, redTeamTurrets, redTeamDragons, redTeamBarons);
                        leagueStats.push(arrayOfValuesRed);
                    }

                    var inc2 = 0;
                    if (values.length > 0) {
                        //query to insert a batch into leagueStats Table.
                        var sql = "INSERT INTO LeagueStats (matchId, participantNumber, kills, deaths, assists, creepScore, teamId, turrets, dragons, barons) VALUES ?";
                        con.query(sql, [leagueStats], function (err, result) {
                            if (err) throw err;
                            console.log("1 record inserted, total: " + (++inc2));
                        });
                    }
                }
            }
        });
    }
}
module.exports = EventDetails;
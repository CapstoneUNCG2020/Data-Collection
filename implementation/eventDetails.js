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

//Read in eventsTable and if we have an eventId that has a status of 3 
//and is LCS then fetch the details of said game....

//  EventID or MatchID  Name startTime              State   teamName     code   teamName code
//	103462440145619657	LCS	 2020-02-22 22:00:00	3		100 Thieves	 100	TSM	     TSM

class EventDetails {

    async notAClue(headers) {

        //Select all games that have a state of 3 and then run through them..... 
        let sql = "SELECT * FROM Events WHERE Events.currentState = 3 and Events.name != 'LPL'";
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
                
                /*
                EventId 103535402770536747
                GameId 103535402770536748
                I'm having an issue where `https://feed.lolesports.com/livestats/v1/window/103535402770536748` will not go through... 
                However, something like `https://feed.lolesports.com/livestats/v1/window/103535402770536746` Will go through... 
                both numbers at the end are the same length... I'm confused as shit

                All I can think of is maybe its bad data and when it happense we can just discard the data there and skip to the next working data?
                */
                //Can now use the gameId to go in and get the match details... first have to map the playerId's with the participantId(Number) which is used to reference to each player instead of the playerId for the duration of the game....
                const windowApi_url = 'https://feed.lolesports.com/livestats/v1/window/'.concat(BigInt(gameId));
                const windowResponse = await fetch(windowApi_url, { method: 'GET', headers: headers });
                const windowJson = await windowResponse.json();
                var windowParsedJson = JSON.parse(JSON.stringify(windowJson));
                
                console.log(windowParsedJson);
                
                var blueTeamParticipantData = windowParsedJson.gameMetadata.blueTeamMetadata.participantMetadata;
                var redTeamParticipantData = windowParsedJson.gameMetadata.redTeamMetadata.participantMetadata;

                var values = [];

                for(let j = 0; j < blueTeamParticipantData.length; j++){
                    var teamId = windowParsedJson.gameMetadata.blueTeamMetadata.esportsTeamId;
                    console.log("teamId " + teamId);
                    var participantNumber = blueTeamParticipantData[j].participantId;
                    var esportsPlayerId = blueTeamParticipantData[j].esportsPlayerId;
                    console.log("participantId " + participantNumber + " esportPlayerId " + esportsPlayerId);
    
                    let arrayOfValues = [];
                    arrayOfValues.push(result[i].eventId, gameId, teamId, esportsPlayerId, participantNumber);
                    values.push(arrayOfValues);
                }
                for(let k = 0; k < redTeamParticipantData.length; k++){
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
                // var frameInfo = windowParsedJson.frames;
                // var frameInfoLength = frameInfo.length - 1;
                // var pausedInc = 10;

                // while (frameInfo[frameInfoLength].gameState != "finished") {
                //     console.log(frameInfoLength + " len");
                //     var frameTimestamp = frameInfo[frameInfoLength].rfc460Timestamp;
                //     var dateObj = new Date(frameTimestamp);
                //     console.log(dateObj.toISOString() + " FirstTime");
                //     if ((dateObj.getSeconds() % 10) != 0) {
                //         var remainder = 10 - (dateObj.getSeconds() % 10);
                //         console.log(remainder);
                //         dateObj.setSeconds(dateObj.getSeconds() + remainder);
                //     }

                //     if (frameInfo[frameInfoLength].gameState == "paused") {
                //         console.log("IN PAUSED")
                //         dateObj.setSeconds(dateObj.getSeconds() + pausedInc);
                //         pausedInc += 10;
                //     } else {
                //         pausedInc = 10;
                //     }

                //     var test = dateObj.toISOString().split('.')[0] + "Z";
                //     console.log(test + " SecondTime")
                //     const swindowApi_url = 'https://feed.lolesports.com/livestats/v1/window/'.concat(gameId + "?startingTime=" + test);
                //     const swindowResponse = await fetch(swindowApi_url, { method: 'GET', headers: headers });
                //     const swindowJson = await swindowResponse.json();
                //     var swindowParsedJson = JSON.parse(JSON.stringify(swindowJson));

                //     frameInfo = swindowParsedJson.frames;
                //     frameInfoLength = swindowParsedJson.frames.length - 1;
                //     console.log(frameInfoLength + " len");
                // }

                // console.log(frameInfo[frameInfoLength].gameState + " SUCCESFULLY PARSED");
                // var blueTeamFinishedStateMetaData = frameInfo[frameInfoLength].blueTeam;
                // var redTeamFinishedStateMetaData = frameInfo[frameInfoLength].redTeam;
                //Split by particpants, then loop through participant array, building another array of usefull information to have a batch insert with.
            }
            /* Suggestions for tomorrows meeting.... (Once I get this settled I will be able to have most if not every bit of the data in the DB tomorrow...)
            * EventId, GameId, PlayerId, and ParticipantNumber.... git rid of EventPointsId (or in the case of best of series (which we don't support at the moment) we could keep EventPointsId)
            * I think the PK for EventPoints should be a composite PK with EventId and MatchId
            * I then think the PK for League Stats should be a composite as well, with MatchId and ParticipantNumber being the Composite PK for League Stats
            */
        });
    }
}
module.exports = EventDetails;
const express = require('express');
const app = express();
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "emuladder.clannzsjouuv.us-east-1.rds.amazonaws.com",
    user: "emuLadder",
    password: "whatisourpassword",
    port: 3306,
    database: 'emuladder'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


class StandingsForTournament {

    async getStandingsForTournament(headers, tournamentIdArray) {
        for (var i = 0; i < tournamentIdArray.length; i++) {
            const api_url = 'https://esports-api.lolesports.com/persisted/gw/getStandings?hl=en-US&tournamentId='.concat(tournamentIdArray[i]);
            const response = await fetch(api_url, { method: 'GET', headers: headers });
            const json = await response.json();
            var parsedJson = JSON.parse(JSON.stringify(json));

            var rankingsJson = parsedJson.data.standings[0].stages[0].sections[0].rankings;
            for (var j = 0; j < (Object.keys(rankingsJson).length); j++) {
                //console.log(JSON.parse(JSON.stringify(rankingsJson[j])));
                var teamsJson = rankingsJson[j].teams;
                for (var k = 0; k < (Object.keys(teamsJson).length); k++) {
                    this.insertPlayersPerTournament(headers, teamsJson[k].id);
                }
            }
        }
    }


    async insertPlayersPerTournament(headers, teamIdFromAbove) {
        const api_url = 'https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US&id='.concat(teamIdFromAbove);
        const response = await fetch(api_url, { method: 'GET', headers: headers });
        const json = await response.json();
        var parsedJson = JSON.parse(JSON.stringify(json));
        var teams = parsedJson.data.teams;

        var values = [];

        for (let i = 0; i < (Object.keys(teams).length); i++) {
            let teamId = teams[i].id;
            let teamName = teams[i].name;
            let teamCode = teams[i].code;
            let homeLeagueName = teams[i].homeLeague.name;
            let homeLeagueRegion = teams[i].homeLeague.region;

            var teamFoundInc = 0;
            //query to see if team is scheduled to play any this season (attempt to see if the team is current or not)
            let sql = "SELECT * FROM Events as e WHERE e.teamCode = '" + teamCode + "' OR e.teamCode2 = '" + teamCode + "';";
            con.query(sql, function (err, result) {
                if (err) throw err;
                //If there is a record existing in the database of the team playing a game this season then set null flag to false, else set flag to true.

                if (result.length == 0) {
                    console.log("NULL RESULT " + teamCode);
                } else {
                    console.log("TeamFound, total: " + (++teamFoundInc) + " teamCode: " + teamCode);

                    for (let k = 0; k < (Object.keys(teams[i].players).length); k++) {
                        let playerId = teams[i].players[k].id;
                        let playerSummonerName = teams[i].players[k].summonerName;
                        let playerFirstName = teams[i].players[k].firstName;
                        let playerLastName = teams[i].players[k].lastName;
                        let playerImage = teams[i].players[k].image;
                        let playerRole = teams[i].players[k].role;

                        let arrayOfValues = [];
                        arrayOfValues.push(playerId, playerFirstName.replace("'", ""), playerLastName.replace("'", ""), playerSummonerName, playerImage, teamName, teamCode, teamId, playerRole, homeLeagueName);
                        values.push(arrayOfValues);

                    }

                    //query to batch insert into Players Table
                    if (values.length > 0) {
                        var insertInc = 0;
                        //console.log("firstName: " + playerFirstName + " lastName: " + playerLastName + "PlayerSummonerName: " + playerSummonerName + " playerId: " + playerId + " teamCode: " + teamCode);
                        //let sql = "INSERT INTO Players (`playerId`, `firstName`, `lastName`, `displayName`, `image`, `teamName`, `teamCode`, `teamId`, `role`, `region`) VALUES ('" + playerId + "','" + playerFirstName + "','" + playerLastName.replace("'", "") + "','" + playerSummonerName + "','" + playerImage + "','" + teamName + "','" + teamCode + "','" + teamId + "','" + playerRole + "','" + homeLeagueName + "')";
                        let sql = "INSERT INTO Players (`playerId`, `firstName`, `lastName`, `displayName`, `image`, `teamName`, `teamCode`, `teamId`, `role`, `region`) VALUES ?";
                        con.query(sql, [values], function (err, result) {
                            if (err) throw err;
                            console.log("1 record inserted, total: " + (++insertInc) + " team: " + teamCode);
                        });
                    }
                }
            });
        }
    }
}
module.exports = StandingsForTournament;
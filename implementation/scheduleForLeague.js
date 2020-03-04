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


class ScheduleForLeagueImpl{
    /*
    * getScheduleForLeague, will retreive the schedule for all leagues and insert said schedule into the database
    * headers :- contains the headers required to perform the GET request
    * leagueId :- contains the leagueId's for all the leagues we support
    */
    async getScheduleForLeague(headers, leagueId){
        for (var i = 0; i < (Object.keys(leagueId).length); i++) {
            const api_url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId='.concat(leagueId[i].regionLeagueId);
            const response = await fetch(api_url, { method: 'GET', headers: headers });
            const json = await response.json();

            this.parseScheduleForLeague(json);
        }
    }

    /* Helper Method to getScheduleForLeague
    * parseScheduleForLeague, will parse the passed schedule json into features and insert into the database.
    * json :- json format of the schedule for a given league's split.
    */
    parseScheduleForLeague(json) {
        var parsedJson = JSON.parse(JSON.stringify(json));
        //A list of all the scheduled events for the given split.
        var allScheduledEvents = parsedJson.data.schedule.events;

        //Symbolizing that we need to run through all possible combos
        for (var i = 0; i < (Object.keys(allScheduledEvents).length); i++) {
            //to get the startTime
            var startTime = allScheduledEvents[i].startTime;
            startTime = startTime.replace('T', ' ');
            startTime = startTime.replace('Z', '');

            var startTimeCheck = startTime.substring(0, 4);
            var year = new Date().getFullYear();

            //Making sure that we are only storing data thats within the current year.
            if (startTimeCheck == year) {
                //to get the matchID
                var matchID = allScheduledEvents[i].match.id.toString();

                //to get the name
                var name = allScheduledEvents[i].league.name;

                //to get the state
                var stateWord = allScheduledEvents[i].state;
                var state;
                switch (stateWord) {
                    case "completed":
                        state = 3;
                        break;
                    case "unstarted":
                        state = 1;
                        break;
                    case "inProgress":
                        state = 2;
                        break;
                }

                //to get the teamName
                var teamName = allScheduledEvents[i].match.teams[0].name;
                var teamName2 = allScheduledEvents[i].match.teams[1].name;

                //to get the teamCode
                var teamCode = allScheduledEvents[i].match.teams[0].code;
                var teamCode2 = allScheduledEvents[i].match.teams[1].code;

                //query to insert into Events Table
                var inc = 0;
                var sql = "INSERT INTO Events (`eventId`, `name`, `startTime`, `currentState`, `teamName`, `teamCode`, `teamName2`, `teamCode2`) VALUES ('" + matchID + "','" + name + "','" + startTime + "','" + state + "','" + teamName + "','" + teamCode + "','" + teamName2 + "','" + teamCode2 + "')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted, total: " + (++inc));
                });
            }
        }
    }
}
module.exports = ScheduleForLeagueImpl;
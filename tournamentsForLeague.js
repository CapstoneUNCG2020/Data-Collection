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


class TournamentsForLeague{
    constructor(){
        // ID's of the leagues which are seperated by regions and worlds.
        this.leagueId = [
            { 'regionLeagueId': '98767991299243165' }, //LCS : North America
            { 'regionLeagueId': '98767991302996019' }, //LEC : Europe
            { 'regionLeagueId': '98767991310872058' }, //LCK : Korea
            { 'regionLeagueId': '101382741235120470' },//LLA : Latin America
            { 'regionLeagueId': '98767991314006698' }, //LPL : China
            { 'regionLeagueId': '98767991331560952' }, //OPL : Oceania
            { 'regionLeagueId': '98767991332355509' }, //CBLOL : Brazil
            { 'regionLeagueId': '98767991343597634' }, //TCL : Turkey
            { 'regionLeagueId': '98767991349978712' }, //LJL : Japan
            { 'regionLeagueId': '98767975604431411' }  //Worlds : International
        ]
    }

    /*
    * apiGetTournaments, will retreive all the tournaments for a given region
    * headers :- contains the headers required to perform the GET request
    */
    async apiGetTournaments(headers){
        for(var i = 0; i < (Object.keys(this.leagueId).length); i++){
            const api_url = 'https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague?hl=en-US&leagueId='.concat(this.leagueId[i].regionLeagueId);
            const response = await fetch(api_url, { method: 'GET', headers: headers });
            const json = await response.json();
            var parsedJson = JSON.parse(JSON.stringify(json));

            var tournaments = parsedJson.data.leagues[0].tournaments;

            var year = new Date().getFullYear();
            //if start date or end date of the tournament is not within the current year then don't call the getSchedule Method.
            for(var j = 0; j < (Object.keys(tournaments).length); j++){
                var startDate = tournaments[j].startDate;
                startDate = startDate.substring(0,4);
                if(startDate == year){
                    console.log("StartDate: "+startDate+" Tournaments"+JSON.stringify(tournaments[j]));
                    this.apiGetSchedule(headers, i);
                }
            } 
        }
    }

    /* Helper Method to apiGetTorunaments
    * apiGetSchedule, will retreive the schedule for all leagues and insert said schedule into the database
    * headers :- contains the headers required to perform the GET request
    * i :- the current index of the leagueId json which is used to perform the GET request
    */
    async apiGetSchedule(headers, i){
        const api_url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId='.concat(this.leagueId[i].regionLeagueId);
        const response = await fetch(api_url, {method: 'GET', headers: headers});
        const json = await response.json();

        this.parseSchedule(json);
    }

    /* Helper Method to apiGetSChedule
    * pasreSchedule, will parse the passed schedule json into features and insert into the database.
    * json :- json format of the schedule for a given league's split.
    */
    parseSchedule(json){
        var parsedJson = JSON.parse(JSON.stringify(json));
        //A list of all the scheduled events for the given split.
        var allScheduledEvents = parsedJson.data.schedule.events;

        //Symbolizing that we need to run through all possible combos
        for(var i = 0; i < (Object.keys(allScheduledEvents).length); i++){
            //to get the startTime
            var startTime = allScheduledEvents[i].startTime;
            startTime = startTime.replace('T', ' ');
            startTime = startTime.replace('Z', '');

            var startTimeCheck = startTime.substring(0,4);
            var year = new Date().getFullYear();

            //Making sure that we are only storing data thats within the current year.
            if(startTimeCheck == year){
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
module.exports = TournamentsForLeague;
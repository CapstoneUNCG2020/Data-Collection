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


class TournamentsForLeagueImpl{

        /*
        * getTournamentsForYearId :- will get all tournaments for the current year and return an array of tournamentId's
        * headers :- contains the headers required to perform the GET request
        * leagueId :- contains the leagueId's for all the leagues we support
        * return :- tournamentIdArray, which is an array of tournamentId's 
        */ 
        async getTournamentsForYearId(headers, leagueId){
            var tournamentIdArray = [];
            for (var i = 0; i < (Object.keys(leagueId).length); i++) {
                const api_url = 'https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague?hl=en-US&leagueId='.concat(leagueId[i].regionLeagueId);
                const response = await fetch(api_url, { method: 'GET', headers: headers });
                const json = await response.json();
                var parsedJson = JSON.parse(JSON.stringify(json));

                var tournaments = parsedJson.data.leagues[0].tournaments;

                var year = new Date().getFullYear();
                //if start date of the tournament is not within the current year then don't push the tournament to the return array.
                for (var j = 0; j < (Object.keys(tournaments).length); j++) {
                    var startDate = tournaments[j].startDate;
                    startDate = startDate.substring(0, 4);
                    if (startDate == year) {
                        tournamentIdArray.push(tournaments[j].id);     
                    }
                }
            }
            return tournamentIdArray;
        }
}
module.exports = TournamentsForLeagueImpl;
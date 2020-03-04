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


class tempPlayer{
    constructor(){
        // ID's of the leagues which are seperated by regions and worlds.
        this.leagueId = [
            { 'regionLeagueId': '98767991299243165' }, //LCS : North America 10
            { 'regionLeagueId': '98767991302996019' }, //LEC : Europe 10
            { 'regionLeagueId': '98767991310872058' }, //LCK : Korea 10
            { 'regionLeagueId': '101382741235120470' },//LLA : Latin America 8 
            { 'regionLeagueId': '98767991314006698' }, //LPL : China 17
            { 'regionLeagueId': '98767991331560952' }, //OPL : Oceania 8 
            { 'regionLeagueId': '98767991332355509' }, //CBLOL : Brazil 8 
            { 'regionLeagueId': '98767991343597634' }, //TCL : Turkey 9 
            { 'regionLeagueId': '98767991349978712' }, //LJL : Japan 8 
            { 'regionLeagueId': '98767975604431411' }  //Worlds : International
        ]

        this.homeLeagues = [
            {'leagueName' : 'LCS'},
            {'leagueName' : 'LEC'},
            {'leagueName' : 'LCK'},
            {'leagueName' : 'LLA'},
            {'leagueName' : 'LPL'},
            {'leagueName' : 'OPL'},
            {'leagueName' : 'CBLOL'},
            {'leagueName' : 'TCL'},
            {'leagueName' : 'LJL'}
        ]
    }

    async apiGetTeams(headers){
        const api_url = 'https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US';
        const response = await fetch(api_url, { method: 'GET', headers: headers });
        const json = await response.json();
        var parsedJson = JSON.parse(JSON.stringify(json));
        var teams = parsedJson.data.teams;




        

        // for(let i = 0; i < (Object.keys(teams).length); i++){
        //     for(let j = 0; j < (Object.keys(this.homeLeagues).length); j++){
        //         if (teams[i].homeLeague != null) {
        //             if (this.homeLeagues[j].leagueName == teams[i].homeLeague.name) {
        //                 let teamId = teams[i].id;
        //                 let teamName = teams[i].name;
        //                 let teamCode = teams[i].code;
        //                 let homeLeagueName = teams[i].homeLeague.name;
        //                 let homeLeagueRegion = teams[i].homeLeague.region;

        //                 var teamFoundInc = 0;
        //                 //query to see if team is scheduled to play any this season (attempt to see if the team is current or not)
        //                 let sql = "SELECT * FROM Events as e WHERE e.teamCode = '"+teamCode+"' OR e.teamCode2 = '"+teamCode+"';";
        //                 con.query(sql, function (err, result) {
        //                     if (err) throw err;
        //                     //If there is a record existing in the database of the team playing a game this season then set null flag to false, else set flag to true.

        //                     if(result.length == 0){
        //                         console.log("NULL RESULT " + teamCode);
        //                     } else{
        //                         console.log("TeamFound, total: " + (++teamFoundInc) + " teamCode: "+teamCode);
                              
        //                         for (let k = 0; k < (Object.keys(teams[i].players).length); k++) {
        //                             let playerId = teams[i].players[k].id;
        //                             let playerSummonerName = teams[i].players[k].summonerName;
        //                             let playerFirstName = teams[i].players[k].firstName;
        //                             let playerLastName = teams[i].players[k].lastName;
        //                             let playerImage = teams[i].players[k].image;
        //                             let playerRole = teams[i].players[k].role;
                                    
        //                             //query to insert into PlayersModified Table
        //                             var insertInc = 0;
        //                             console.log("firstName: "+playerFirstName+" lastName: "+playerLastName+"PlayerSummonerName: "+playerSummonerName+" playerId: "+playerId+" teamCode: "+ teamCode);
        //                             let sql = "INSERT INTO Players (`playerId`, `firstName`, `lastName`, `displayName`, `image`, `teamName`, `teamCode`, `teamId`, `role`, `region`) VALUES ('" + playerId + "','" + playerFirstName + "','" + playerLastName.replace("'", "") + "','" + playerSummonerName + "','" + playerImage + "','" + teamName + "','" + teamCode + "','" + teamId + "','" +playerRole+"','" +homeLeagueName+"')";
        //                             con.query(sql, function (err, result) {
        //                                 if (err) throw err;
        //                                 console.log("1 record inserted, total: " + (++insertInc) +" team: "+teamCode);
        //                             });
        //                         }
        //                     }
        //                 });
        //             }
        //         }
        //     }
        // }        
    }
}
module.exports = tempPlayer;
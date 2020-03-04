const express = require('express');
const app = express();
// const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
const TournamentsForLeague = require('./tournamentsForLeague.js');
const Players = require('./players.js');
const tempPlayer = require('./tempPlayer.js');
//New Imports
const tournamentsForLeagueImpl = require('./implementation/tournamentsForLeagueImpl');
const scheduleForLeagueImpl = require('./implementation/scheduleForLeague');
const standingsForTournamentImpl = require('./implementation/standingsForTournament');
// const Car = require('./car.js');

// myCar = new Car();
// console.log(myCar.Year + " " + myCar.Type);

// console.log('split');

// myCar.Year = 2000;
// console.log(myCar.Year);

// console.log();

// console.log(process.env);

const api_key = process.env.API_KEY;

// const database = new Datastore('database.db');
// database.loadDatabase();

app.listen(3000, () => console.log('listening at 3000'));

var headers = {
    "x-api-key" : api_key
}

//testingAPI(headers);


// ID's of the leagues which are seperated by regions and worlds.
leagueId = [
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

//scheduleForLeague = new scheduleForLeagueImpl();

//scheduleForLeague.getScheduleForLeague(headers, leagueId);

tournamentsForLeague = new tournamentsForLeagueImpl();


(async () => {
    var tournamentIdArray = await getTournamentIds();
    
    standingsForTournament = new standingsForTournamentImpl();
    
    standingsForTournament.getStandingsForTournament(headers, tournamentIdArray);
    // all of the script.... 

})();





async function getTournamentIds(){
    var arrayOfTournamentIds;
    arrayOfTournamentIds = await tournamentsForLeague.getTournamentsForYearId(headers, leagueId);

    // for(var i = 0; i < arrayOfTournamentIds.length; i++){
    //     console.log(arrayOfTournamentIds[i].toString());
    // }



    return arrayOfTournamentIds;
}
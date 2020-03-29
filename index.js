const express = require('express');
const app = express();
const fetch = require('node-fetch');
require('dotenv').config();
//New Imports
const tournamentsForLeagueImpl = require('./implementation/tournamentsForLeagueImpl');
const scheduleForLeagueImpl = require('./implementation/scheduleForLeague');
const standingsAndPlayersForTournamentImpl = require('./implementation/standingsAndPlayersForTournament');
const eventDetailsImpl = require('./implementation/eventDetails');

const api_key = process.env.API_KEY;

app.listen(3000, () => console.log('listening at 3000'));

var headers = {
    "x-api-key" : api_key
}

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

//Fills out Events Table
// scheduleForLeague = new scheduleForLeagueImpl();

// scheduleForLeague.getScheduleForLeague(headers, leagueId);

//Fills out Players Table
// tournamentsForLeague = new tournamentsForLeagueImpl();

// (async () => {
//     var tournamentIdArray = await getTournamentIds();
    
//     standingsAndPlayersForTournament = new standingsAndPlayersForTournamentImpl();
    
//     standingsAndPlayersForTournament.getStandingsForTournament(headers, tournamentIdArray);
// })();

// async function getTournamentIds(){
//     var arrayOfTournamentIds;
//     arrayOfTournamentIds = await tournamentsForLeague.getTournamentsForYearId(headers, leagueId);

//     return arrayOfTournamentIds;
// }

//Fills out EventPoints Table
eventDetails = new eventDetailsImpl();
eventDetails.notAClue(headers);
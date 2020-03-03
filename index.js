const express = require('express');
const app = express();
// const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
const TournamentsForLeague = require('./tournamentsForLeague.js');
const Players = require('./players.js');
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

testing = new TournamentsForLeague();
testing2 = new Players();

// testing.apiGetTournaments(headers);
testing2.apiGetTeams(headers);
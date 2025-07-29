const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
// console.log(process.env);

const app = express();
const port = process.env.PORT || 3000;
// in browser, must use localhost:3000, not GoLive
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('public'));

// JSON parser, understand incoming data as JSON
// request object updated with new body object containing parsed data
app.use(express.json({ limit: '1mb'}));

const database = new Datastore('database.db');
database.loadDatabase();

app.get('/api', (req, res) => {
  database.find({}, (err, data) => {
    if (err) {
      res.end();
      return;
    }
    res.json(data);
  });
});

app.post('/api', (req, res) => {
  console.log('request received');
  // console.log(req.body);
  // JSON string is received from client, parsed into object
  const data = req.body;
  
  const timestamp = Date.now();
  data.timestamp = timestamp;

  // insert data (object) into database
  database.insert(data);

  // complete request
  // express Response function
  // sends response back to client as JSON, the parameter coverted to JSON string
  res.json(data);

  // response.json({
  //   status: 'success',
  //   timestamp: timestamp,
  //   latitude: data.lat,
  //   longitude: data.lon
  // });
});


// must install node-fetch?

app.get('/weather/:latlon', async (req, res) => {
  // route parameters
  const latlon = req.params.latlon.split(',');
  // const lat = latlon[0];
  // const lon = latlon[1];
  // Boston
  const lat = 42.36;
  const lon = -71.0588;
  
  const API_KEY_WEATHERMAP = process.env.API_KEY_WEATHERMAP;
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY_WEATHERMAP}`;
  const weatherResponse = await fetch(weatherURL);
  const weatherData = await weatherResponse.json();

  const API_KEY_OPENAQ = process.env.API_KEY_OPENAQ;
  const aqURL = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}`;
  // request options, request must use valid body data type
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY_OPENAQ
    },
  };
  const aqResponse = await fetch(aqURL, options);
  const aqData = await aqResponse.json();

  const atmosphereData = {
    weather: weatherData,
    air_quality: aqData
  };
  res.json(atmosphereData);
});



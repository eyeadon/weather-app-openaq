import express from "express";
import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

const app = express();

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`listening at ${port}`));

// app.use(express.static("public"));

// JSON parser, understand incoming data as JSON
// request object updated with new body object containing parsed data
// app.use(express.json());

app.get("/weather/:latlon", async (req, res) => {
  // route parameters
  const latlon = req.params.latlon.split(",");

  const lat = latlon[0];
  const lon = latlon[1];

  // // Fenway Park, Boston
  // const lat = 42.3467;
  // const lon = -71.0972;

  const API_KEY_WEATHERMAP = process.env.API_KEY_WEATHERMAP;
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY_WEATHERMAP}`;
  const weatherResponse = await fetch(weatherURL);
  const weatherData = await weatherResponse.json();

  const API_KEY_OPENAQ = process.env.API_KEY_OPENAQ;
  const aqURL = `https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=25000&limit=10`;

  // request options, request must use valid body data type
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY_OPENAQ,
    },
  };
  const aqResponse = await fetch(aqURL, options);
  const aqData = await aqResponse.json();

  const atmosphereData = {
    weather: weatherData,
    air_quality: aqData,
  };
  res.json(atmosphereData);
});

app.get("/air_quality/:sensorId", async (req, res) => {
  const sensorId = req.params.sensorId;

  const API_KEY_OPENAQ = process.env.API_KEY_OPENAQ;
  const aqMeasurementsURL = `https://api.openaq.org/v3/sensors/${sensorId}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY_OPENAQ,
    },
  };
  const response = await fetch(aqMeasurementsURL, options);
  const data = await response.json();

  const airQualityData = {
    measurements: data,
  };
  res.json(airQualityData);
});

export default app;

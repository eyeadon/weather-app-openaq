function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function toFixedNumber(num, digits) {
  var pow = Math.pow(10, digits);
  return Math.round(num * pow) / pow;
}

async function getWeatherData() {
  let coordinates = {};
  let atmoDataObject = {};

  if ("geolocation" in navigator) {
    console.log("geolocation available");

    document.getElementById("city").innerHTML = "<em>NO READING YET</em>";
    document.getElementById("summary").innerHTML = "<em>NO READING YET</em>";
    document.getElementById("temperature").textContent = "";

    document.getElementById("aq_city").innerHTML = "<em>NO READING YET</em>";
    document.getElementById("aq_parameter").textContent = "?";
    document.getElementById("aq_units").textContent = "?";
    document.getElementById("aq_value").textContent = "";
    document.getElementById("aq_date").textContent = "?";

    atmoDataObject = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        coordinates.lat = toFixedNumber(position.coords.latitude, 4);
        coordinates.lon = toFixedNumber(position.coords.longitude, 4);

        try {
          document.getElementById("lat").textContent =
            coordinates.lat.toFixed(2);
          document.getElementById("lon").textContent =
            coordinates.lon.toFixed(2);
          // console.log(position);

          const apiWeatherURL = `/weather/${coordinates.lat},${coordinates.lon}`;
          const weatherResponse = await fetch(apiWeatherURL);
          atmoDataObject = await weatherResponse.json();
          console.log(atmoDataObject);

          const weatherCity = atmoDataObject.weather.name;
          const weatherSum = atmoDataObject.weather.weather[0].main;
          const weatherTemp = atmoDataObject.weather.main.temp;
          const weatherIcon = atmoDataObject.weather.weather[0].icon;

          function addimage() {
            var img = new Image();
            img.src = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
            document.getElementById("img_weatherIcon").appendChild(img);
          }

          addimage();

          document.getElementById("city").textContent = weatherCity;
          document.getElementById("summary").textContent = weatherSum;
          document.getElementById("temperature").textContent = weatherTemp;

          resolve(atmoDataObject);
        } catch (error) {
          reject(console.error(error));
          document.getElementById("city").textContent = "NO READING";
          document.getElementById("summary").textContent = "NO READING";
          document.getElementById("temperature").textContent = "NO READING";
        }
      }); // end getCurrentPosition
    }); // end Promise
  } else {
    console.log("geolocation not available");
  }

  return { coordinates, atmoDataObject };
}

async function getAirQualityData(atmoDataObject) {
  try {
    const airQualityCities = atmoDataObject.air_quality.results;
    const airQualityCity = airQualityCities[0];
    const airQualitySensors = airQualityCity.sensors;
    let sensorId = airQualitySensors[0];

    for (const element of airQualitySensors) {
      if (element.name.includes("pm25")) sensorId = element.id;
    }

    const apiAirQualityURL = `/air_quality/${sensorId}`;
    const airQualityResponse = await fetch(apiAirQualityURL);
    const airQualityDataObject = await airQualityResponse.json();
    console.log(airQualityDataObject);

    const airQuality = airQualityDataObject.measurements.results[0];
    const airQualityLatestDate = new Date(airQuality.latest.datetime.local);

    document.getElementById("aq_city").textContent = airQualityCity.name;
    document.getElementById("aq_parameter").textContent =
      airQuality.parameter.displayName;
    document.getElementById("aq_units").textContent =
      airQuality.parameter.units;
    document.getElementById("aq_value").textContent = airQuality.latest.value;
    document.getElementById("aq_date").textContent =
      airQualityLatestDate.toLocaleString();
  } catch (error) {
    console.error(error);
    airQuality = { value: -1 };
    document.getElementById("aq_value").textContent = "NO READING";
  }
}

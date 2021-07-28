const APIK = "78686b829cdb5561f3acfa1f964c0c87"; // left exposed for this project's purposes

// function to get the city(s) from the API based on user's input (q)
async function getCity(q) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=10&appid=${APIK}`
    );
    if (response.status === 404) {
      // TODO: Display error message on the screen
      throw Error("City not found");
    }
    const cityArray = await response.json();
    return cityArray;
  } catch (err) {
    console.log(err);
    displayError(err.message);
  }
}

// function to get the array of promises bound to the click event listener to select city
const getPromises = function () {
  let promises = [];
  document.querySelectorAll(".city").forEach(function (element) {
    promises.push(
      new Promise(function (resolve) {
        element.addEventListener("click", resolve, { once: true });
      })
    );
  });
  return promises;
};

// function to list out multiple cities returned from query
function cityListing(cities) {
  const div = document.querySelector("#mainContent");
  const list = document.createElement("ul");
  for (city of cities) {
    const li = document.createElement("li");
    const citySpan = document.createElement("span");
    citySpan.classList.add("cityName");
    citySpan.innerText = `${city.name}`;
    li.appendChild(citySpan);

    const txtnd1 = document.createTextNode(" country: ");
    li.appendChild(txtnd1);
    const countrySpan = document.createElement("span");
    countrySpan.classList.add("countryName");
    countrySpan.innerText = `${city.country}`;
    li.appendChild(countrySpan);

    if (city.state) {
      const txtnd2 = document.createTextNode(" state: ");
      li.appendChild(txtnd2);
      const stateSpan = document.createElement("span");
      stateSpan.classList.add("countryName");
      stateSpan.innerText = `${city.state}`;
      li.appendChild(stateSpan);
    }
    li.classList.add("city");
    li.city = city;
    list.appendChild(li);
  }
  div.appendChild(list);
}

// function to get the query from the user and kick things off
function handleInput(e) {
  const query = document.querySelector("#cityInput").value;
  if (e.type === "click" || e.keyCode === 13) {
    if (query === "") return;
    main(document.querySelector("#cityInput").value);
    clean();
  }
}

// function to clean up the input field and the DOM body
function clean() {
  document.querySelector("#cityInput").value = "";
  document.querySelector("#mainContent").innerText = "";
  if (document.querySelector(".unitContainer"))
    document.querySelector(".unitContainer").remove();
}

// function to call the weather API
async function getWeather(lat, lon, units = "metric") {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly&appid=${APIK}`
    );
    const json = await response.json();
    return { json, units };
  } catch (err) {
    console.log(err);
    displayError(err.message);
  }
}

// function to calculate from wind degrees (provided by API) to wind direction
function windDirection(deg) {
  const wind_dir = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  let _ = deg / 22.5 + 0.5;
  if (_ >= 16) _ = 1;
  return wind_dir[_.toFixed(0) - 1];
}

// function to get a date string from UTC timestamp
function getDateString(utc) {
  const days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  let date = new Date(utc * 1000);
  return `${days[date.getDay()]} ${date.getMonth()+1}/${date.getDate()}`;
}

// function for displaying the weather info
function displayInfo({ name, weatherData, units }) {
  console.log(weatherData);
  clean();
  whatstheTemp(weatherData, units);
  const lat = weatherData.lat,
    lon = weatherData.lon;
  if (!document.querySelector(".unitContainer")) {
    addUnitToggle({ name, lat, lon, units });
  }

  if (units === "metric") {
    units = { speed: "m/s", temp: "C" };
  } else {
    units = { speed: "mph", temp: "F" };
  }

  const mainCard = document.createElement("div");
  mainCard.classList.add("mainCard");

  //right column of mainCard, only displaying temp
  const rightColumn = document.createElement("div");
  rightColumn.classList.add("rightMainColumn");
  rightColumn.innerText = `${weatherData.current.temp.toFixed(0)}°${
    units.temp
  }`;

  // left column of mainCard, parent of 3 element
  const leftColumn = document.createElement("div");
  leftColumn.classList.add("leftMainColumn");

  // first part of left column, displaying name
  const nameDiv = document.createElement("div");
  nameDiv.classList.add("mainColumnItem");
  nameDiv.classList.add("cityName");
  nameDiv.innerText = `${name}`;
  leftColumn.appendChild(nameDiv);

  // second part of the left column, displaying the weather description
  const descDiv = document.createElement("div");
  descDiv.classList.add("mainColumnItem");
  descDiv.innerText = `${weatherData.current.weather[0].description}`;
  leftColumn.appendChild(descDiv);

  // third part of the left column, displaying feels like
  const feelsDiv = document.createElement("div");
  feelsDiv.classList.add("mainColumnItem");
  feelsDiv.innerText = `feels like: ${weatherData.current.feels_like.toFixed(
    0
  )}°${units.temp}`;
  leftColumn.appendChild(feelsDiv);

  // fourth part of the left column, displaying wind speed and direction
  const windDiv = document.createElement("div");
  windDiv.classList.add("mainColumnItem");
  windDiv.innerText = `wind: ${weatherData.current.wind_speed.toFixed(0)} ${
    units.speed
  } ${windDirection(weatherData.current.wind_deg)}`;
  leftColumn.appendChild(windDiv);

  // forecast cards for the next 8 days
  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  for (day of weatherData.daily) {
    console.log(day.dt)
    console.log(weatherData.daily[0].dt)
    if(day.dt === weatherData.daily[0].dt) continue; //since the first entry in the array is for today we check for that and skip it
    let dateString = getDateString(day.dt);
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecastCard");

    const dateDiv = document.createElement("div");
    dateDiv.innerText = dateString;

    const icon = document.createElement("img");
    icon.src = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

    const descDiv = document.createElement("div");
    descDiv.innerText = day.weather[0].description;

    const dayTempDiv = document.createElement("div");
    dayTempDiv.innerText = `day: ${day.temp.day.toFixed(0)}°${units.temp}`;

    const nightTempDiv = document.createElement("div");
    nightTempDiv.innerText = `night: ${day.temp.night.toFixed(0)}°${
      units.temp
    }`;

    forecastCard.appendChild(dateDiv);
    forecastCard.appendChild(icon);
    forecastCard.appendChild(descDiv);
    forecastCard.appendChild(dayTempDiv);
    forecastCard.appendChild(nightTempDiv);
    forecastContainer.appendChild(forecastCard);
  }

  mainCard.appendChild(leftColumn);
  mainCard.appendChild(rightColumn);
  document.querySelector("#mainContent").appendChild(mainCard);
  document.querySelector("#mainContent").appendChild(forecastContainer);

  // card that displays weather alerts (if any)
  if (weatherData.alerts) {
    const alertContainer = document.createElement("div");
    alertContainer.classList.add("alertContainer");

    for (alert of weatherData.alerts) {
      const alertDiv = document.createElement("div");
      alertDiv.classList.add("alertCard");

      const fromDiv = document.createElement("div");
      fromDiv.innerText = `from: ${alert.sender_name}`;

      const msgDiv = document.createElement("div");
      msgDiv.innerText = alert.description;

      alertDiv.appendChild(fromDiv);
      alertDiv.appendChild(msgDiv);
      alertContainer.appendChild(alertDiv);
    }
    document.querySelector("#mainContent").appendChild(alertContainer);
  }
}

// function to add a unit toggle
function addUnitToggle({ name, lat, lon, units }) {
  const unitToggleDiv = document.createElement("div");
  unitToggleDiv.classList.add("unitContainer");

  const metricLink = document.createElement("a");
  metricLink.innerText = "metric";
  metricLink.href = "#";

  const imperialLink = document.createElement("a");
  imperialLink.innerText = "imperial";
  imperialLink.href = "#";

  unitToggleDiv.appendChild(metricLink);
  unitToggleDiv.appendChild(document.createTextNode(" | "));
  unitToggleDiv.appendChild(imperialLink);
  document.querySelector("nav").appendChild(unitToggleDiv);

  [metricLink, imperialLink].forEach((element) => {
    element.addEventListener("click", async (e) => {
      if (units === e.target.innerText) {
        return;
      } else {
        units = e.target.innerText;
      }
      const { json: weatherData } = await getWeather(lat, lon, units);
      displayInfo({ name, weatherData, units });
    });
  });
}

// error displaying function
function displayError(message) {
  clean();
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("city");
  errorDiv.classList.add("error");
  errorDiv.innerText = message;
  document.querySelector("#mainContent").appendChild(errorDiv);
}

// function to change styling
function changeStyling(status) {
  const directory = {
    default: "style",
    cold: "cold",
    normal: "style",
    warm: "warm",
    hot: "hot",
    veryhot: "veryhot",
  };
  document.querySelector("#style").href = `static/${directory[status]}.css`;
}

// function to call changeStyling function based on parameters
function whatstheTemp(weatherData, units) {
  const temp = weatherData.current.temp;
  if (
    (units === "metric" && temp > 35) ||
    (units === "imperial" && temp > 95)
  ) {
    changeStyling("veryhot");
  } else if (
    (units === "metric" && temp > 25) ||
    (units === "imperial" && temp > 77)
  ) {
    changeStyling("hot");
  } else if (
    (units === "metric" && temp > 15) ||
    (units === "imperial" && temp > 59)
  ) {
    changeStyling("warm");
  } else if (
    (units === "metric" && temp <= 5) ||
    (units === "imperial" && temp <= 41)
  ) {
    changeStyling("cold");
  }
}

// "main" function
async function main(query) {
  try {
    // we get lat and lon from the returned city, or if multiple from user selecting one from the list
    let lat, lon, name;
    changeStyling("default");
    const city = await getCity(query);
    if (city.length === 0) {
      throw new Error("City not found");
    } else if (city.length === 1) {
      lat = city[0].lat;
      lon = city[0].lon;
      name = city[0].name;
    } else {
      cityListing(city);
      await Promise.race(getPromises())
        .then(function (click) {
          // in case the click is on one of the inner elements
          if (click.target.className !== "city") {
            lat = click.target.parentElement.city.lat;
            lon = click.target.parentElement.city.lon;
            name = click.target.parentElement.city.name;
          } else {
            lat = click.target.city.lat;
            lon = click.target.city.lon;
            name = click.target.city.name;
          }
        })
        .catch(function (error) {
          console.log(error);
          displayError(err.message);
        });
    }

    // we now call the weather API with the lat/lon
    const { json: weatherData, units } = await getWeather(lat, lon);
    displayInfo({ name, weatherData, units });
  } catch (err) {
    console.log(err);
    displayError(err.message);
  }
}

// top level code
const input = document.querySelector("#cityInput");
const btn = document.querySelector("#submitBtn");

// clean input field
input.value = "";

input.focus();
input.addEventListener("keypress", handleInput);
btn.addEventListener("click", handleInput);

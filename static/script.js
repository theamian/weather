const APIK = '78686b829cdb5561f3acfa1f964c0c87'

// function to get the city(s) from the API based on user's input (q)
async function getCity(q) {
    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=10&appid=${APIK}`);
        if(response.status === 404) throw Error("City not found");
        const cityArray = await response.json();
        return cityArray;
    }
    catch(err) {
        console.log(err);
    }
}

// function to get the array of promises bound to the click event listener to select city
const getPromises = function() {
    let promises = [];
    document.querySelectorAll(".city").forEach(function(element) {
        promises.push(new Promise(function(resolve) {
            element.addEventListener("click", resolve, {once:true})
        }))
    })
    return promises;
};


// function to list out multiple cities returned from query
function cityListing(cities) {
    const div = document.querySelector("#mainContent");
    const list = document.createElement("ul");
    for(city of cities) {
        const li = document.createElement("li");
        li.innerText = `name: ${city.name}, country: ${city.country}`;
        if(city.state) li.innerText += `, state: ${city.state}`;
        li.classList.add("city");
        li.city = city;
        list.appendChild(li);
    }
    div.appendChild(list);
}

// function to receive the search query from user via promises bound to button click and input enter key press
const getQuery = function() {
    const input = document.querySelector("#cityInput");
    const btn = document.querySelector("#submitBtn");

    let promise1 = new Promise(function(resolve) {
        input.addEventListener("keypress", function(e) {
            if(e.keyCode === 13) resolve(input.value);
        })
    })

    let promise2 = new Promise(function(resolve) {
        btn.addEventListener("click", function() {
            resolve(input.value);
        })
    })

    return [promise1, promise2];
};

// function to get the query from the user and kick things off
function handleInput(e) {
    if(e.type === "click" || e.keyCode === 13) {
        main(document.querySelector("#cityInput").value);
        clean();
    }
}

// function to clean up the input field and the DOM body
function clean() {
    document.querySelector("#cityInput").value = "";
    document.querySelector("#mainContent").innerText = "";
}


// "main" function
async function main(query) {
    try {
        // we get lat and lon from the returned city, or if multiple from user selecting one from the list
        let lat, lon;
        const city = await getCity(query);
        if(city.length === 0) {
            throw new Error("City not found");
        } else if(city.length === 1) {
            lat = city[0].lat;
            lon = city[0].lon;
        } else {
            cityListing(city);
            Promise.race(getPromises())
            .then(
                function(click) {
                    lat = click.target.city.lat;
                    lon = click.target.city.lon;
            })
            .catch(
                function(error) {
                    console.log(error);
            })
        }
    } catch(err) {
        console.log(err)
    }
}

// top level code
const input = document.querySelector("#cityInput");
const btn = document.querySelector("#submitBtn");

// clean input field
input.value = "";

input.addEventListener("keypress", handleInput);
btn.addEventListener("click", handleInput);

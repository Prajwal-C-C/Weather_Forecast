const apiKey = "00f515fd53a31cafd9607a9c3bdb9f70";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const leftPanel = document.querySelector(".left-panel");
const forecastList = document.querySelector("#forecast-list");

let globalForecastData = []; 

// 1. Check Weather by City Name
async function checkWeather(city) {
    try {
        const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
        if (!response.ok) throw new Error("City not found");
        
        const data = await response.json();

        // Update Left Panel (Current Weather)
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        document.querySelector(".desc").innerHTML = data.weather[0].description;
        
        const weatherMain = data.weather[0].main;
        const iconCode = data.weather[0].icon;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        updateBackground(weatherMain);
        
        // Fetch Forecast
        getForecast(city);

    } catch (error) {
        alert("City not found! Please check the spelling.");
    }
}

// 2. Fetch Forecast Data
async function getForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const data = await response.json();
    globalForecastData = data.list;
    
    showHourly(); // Default view
}

// --- NEW LOGIC HERE ---

function showHourly() {
    // 1. Highlight the correct tab
    document.querySelectorAll(".tab-btn")[0].classList.add("active");
    document.querySelectorAll(".tab-btn")[1].classList.remove("active");

    // 2. Get the current time
    const now = new Date();
    
    // 3. Filter: Keep only times that are strictly in the FUTURE
    const next24Hours = globalForecastData.filter(item => {
        const itemDate = new Date(item.dt_txt);
        
        // STRICT CHECK: The forecast time must be AFTER the current time.
        // If it's 6:15 PM, the 6:00 PM slot (18:00) is in the past, so it's removed.
        // The first item will be 9:00 PM (21:00).
        return itemDate > now; 
    });

    // 4. Slice: Take the next 8 items from that future list
    const hourlyData = next24Hours.slice(0, 8);
    
    // 5. Render List
    forecastList.innerHTML = "";
    
    // Handle edge case where no data is left (end of 5-day list)
    if (hourlyData.length === 0) {
        forecastList.innerHTML = "<p class='placeholder-text'>No upcoming hourly data available.</p>";
        return;
    }

    hourlyData.forEach(item => {
        // Format time nicely (e.g., "9:00 PM")
        const time = new Date(item.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const temp = Math.round(item.main.temp) + "°C";
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        const html = `
            <div class="list-item">
                <p class="item-time">${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p class="item-desc">${desc}</p>
                <p class="item-temp">${temp}</p>
            </div>
        `;
        forecastList.innerHTML += html;
    });
}

function showWeekly() {
    // UI: Toggle Active Tab
    document.querySelectorAll(".tab-btn")[0].classList.remove("active");
    document.querySelectorAll(".tab-btn")[1].classList.add("active");

    // LOGIC: Filter for Next Days only
    const weeklyData = globalForecastData.filter(item => {
        const date = new Date(item.dt_txt);
        const today = new Date();
        
        // 1. Must be around Noon (12:00:00) to get a good day temperature
        const isNoon = item.dt_txt.includes("12:00:00");
        
        // 2. Must NOT be Today (Check if date matches today's date)
        const isNotToday = date.getDate() !== today.getDate();
        
        return isNoon && isNotToday;
    });

    forecastList.innerHTML = "";
    
    weeklyData.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp) + "°C";
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        const html = `
            <div class="list-item">
                <p class="item-time" style="width:120px">${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p class="item-desc">${desc}</p>
                <p class="item-temp">${temp}</p>
            </div>
        `;
        forecastList.innerHTML += html;
    });
}

// --- HELPER FUNCTIONS ---

function updateBackground(weather) {
    if (weather === "Clear") {
        leftPanel.style.background = "linear-gradient(135deg, #fce38a, #f38181)";
    } else if (weather === "Clouds") {
        leftPanel.style.background = "linear-gradient(135deg, #5c6bc0, #512da8)";
    } else if (weather === "Rain") {
        leftPanel.style.background = "linear-gradient(135deg, #243b55, #141e30)";
    } else if (weather === "Drizzle") {
        leftPanel.style.background = "linear-gradient(135deg, #4ca1af, #c4e0e5)";
    } else if (weather === "Mist") {
        leftPanel.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    } else {
        leftPanel.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
    }
}

// Geolocation Support
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                checkWeatherByCoords(lat, lon);
            },
            (error) => {
                // If denied, show default city (e.g., London or New York)
                checkWeather("London");
            }
        );
    } else {
        checkWeather("London");
    }
}

async function checkWeatherByCoords(lat, lon) {
    const coordsUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastUrlCoords = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(coordsUrl);
        const data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        document.querySelector(".desc").innerHTML = data.weather[0].description;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        
        updateBackground(data.weather[0].main);

        const forecastResponse = await fetch(forecastUrlCoords);
        const forecastData = await forecastResponse.json();
        globalForecastData = forecastData.list;
        showHourly();

    } catch (error) {
        console.error("Error fetching weather by coords:", error);
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keydown", (e) => {
    if(e.key === "Enter") checkWeather(searchBox.value);
});

// Start App
getUserLocation();
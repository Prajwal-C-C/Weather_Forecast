const apiKey = "00f515fd53a31cafd9607a9c3bdb9f70";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
// NEW: Forecast API URL
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");
const errorMsg = document.querySelector(".error");

// Function 1: Get Current Weather
async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
        errorMsg.style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        errorMsg.style.display = "none";
        var data = await response.json();

        // Update Text
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        let desc = data.weather[0].description;
        document.querySelector(".status-message").innerHTML = desc.charAt(0).toUpperCase() + desc.slice(1);

        // Update Main Icon & Background
        updateWeatherVisuals(data.weather[0].main);

        // --- CALL THE NEW FORECAST FUNCTION HERE ---
        getForecast(city);

        document.querySelector(".weather").style.display = "block";
    }
}

// Function 2: Get Hourly & Weekly Forecast
async function getForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const data = await response.json();

    // --- PART A: HOURLY FORECAST (Next 24 hours) ---
    const hourlyContainer = document.querySelector(".hourly-container");
    hourlyContainer.innerHTML = ""; // Clear old data
    
    // The API gives data every 3 hours. slice(0, 8) takes the next 8 items (24 hours)
    const next24Hours = data.list.slice(0, 8); 

    next24Hours.forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp) + "°C";
        const icon = item.weather[0].icon;
        
        const hourlyHTML = `
            <div class="hourly-card">
                <p>${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
                <p>${temp}</p>
            </div>
        `;
        hourlyContainer.innerHTML += hourlyHTML;
    });

    // --- PART B: WEEKLY FORECAST (Next 5 Days) ---
    const weeklyContainer = document.querySelector(".weekly-container");
    weeklyContainer.innerHTML = ""; // Clear old data

    // Filter to get only one reading per day (e.g., at 12:00:00 PM)
    const dailyForecast = data.list.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyForecast.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString([], { weekday: 'long' }); // e.g., "Monday"
        const temp = Math.round(day.main.temp) + "°C";
        const icon = day.weather[0].icon;
        const desc = day.weather[0].description;

        const weeklyHTML = `
            <div class="weekly-row">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
                <p>${desc}</p>
                <p style="font-weight: bold;">${temp}</p>
            </div>
        `;
        weeklyContainer.innerHTML += weeklyHTML;
    });
}

// Helper Function: Changes Background & Icon based on weather
function updateWeatherVisuals(weatherType) {
    if (weatherType == "Clouds") {
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
        card.style.background = "linear-gradient(135deg, #5c6bc0, #512da8)";
    } else if (weatherType == "Clear") {
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
        card.style.background = "linear-gradient(135deg, #fce38a, #f38181)";
    } else if (weatherType == "Rain") {
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
        card.style.background = "linear-gradient(135deg, #243b55, #141e30)";
    } else if (weatherType == "Drizzle") {
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
        card.style.background = "linear-gradient(135deg, #4ca1af, #c4e0e5)";
    } else if (weatherType == "Mist") {
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
        card.style.background = "linear-gradient(135deg, #cfd9df, #e2ebf0)";
        card.style.color = "#333"; // Dark text for light background
        return; 
    }
    card.style.color = "#fff"; // Reset text to white for other backgrounds
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
})

searchBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
    }
})
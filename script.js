const apiKey = "00f515fd53a31cafd9607a9c3bdb9f70";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
        alert("Invalid City Name");
    } else {
        var data = await response.json();

        let temp = data.main.temp;
        let humidity = data.main.humidity;
        let wind = data.wind.speed;

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(temp) + "°C";
        document.querySelector(".humidity").innerHTML = humidity + "%";
        document.querySelector(".wind").innerHTML = wind + " km/h";

        let messageText = ""; 
        
        if (humidity > 75 && wind > 20) {
            messageText = "Rainy 🌧️";
        }
 
        else if (temp >= 15 && temp <= 30 && humidity < 70 && wind < 25) {
            messageText = "Cool ❄️";
        }

        else if (temp > 30) {
            messageText = "Hot 🔥";
        }
  
        else if (temp < 15) {
            messageText = "Cool ❄️";
        }
  
        else {
            messageText = "Normal ☁️";
        }

        document.querySelector(".status-message").innerHTML = messageText;

        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
        }

        document.querySelector(".weather").style.display = "block";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
})

searchBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
    }
})
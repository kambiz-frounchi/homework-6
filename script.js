var apiKey = "appid=9b4d2a99fd5695a6f9d466d71178ca21";
var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?";
var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?";
var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?";

var LOW_UV_INDEX_MAX = 2;
var MODERATE_UV_INDEX_MAX = 5;

//array of objects (each object contains the city name and a lastVisited flag indicating whether this was the last search item)
var cityArray = [];

function addCityToPage(city) {
    $("#city-history").append($("<button>").addClass("btn btn-secondary city-button").text(city).attr("data-city", city).on("click", processCityButton));
}

function getWeatherInfo(city) {
    query = currentWeatherURL + apiKey + "&q=" + city + "&units=imperial";
    $.ajax({url: query, method: "GET"}).then(function(response) {
        console.log(response);
        $("#icon").attr("src", "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png").removeAttr("hidden");
        $("#temperature").text("Temperature: " + response.main.temp + " \xB0F");
        $("#humidity").text("Humidity: " + response.main.humidity + " %");
        $("#wind-speed").text("Wind Speed: " + response.wind.speed + " MPH");
        query = uvIndexURL + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
        $.ajax({url: query, method: "GET"}).then(function(response) {
            console.log(response);
            var backgroundColor = "red";
            if (response.value <= LOW_UV_INDEX_MAX) {
                //favorable:green
                backgroundColor = "green";
            } else if (response.value <= MODERATE_UV_INDEX_MAX) {
                //moderate: yellow
                backgroundColor = "yellow";
            } else  {
                //severe
                backgroundColor = "red";
            }

            $("#uv-index").text("UV Index: ");
            $("#uv-index-value").text(response.value).css("background-color", backgroundColor);
        });

        query = forecastURL + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=imperial";
        $.ajax({url: query, method: "GET"}).then(function(response) {
            console.log(response)
            $("#five-day-label").text("5-Day Forecast:");

            response.daily.forEach(function(item, index) {
                if ((index > 0) && (index < 6)) {
                    $("#day" + index).find("#forecast-date").text(moment(item.dt * 1000).format("l"));
                    $("#day" + index).find("#forecast-icon").attr("src", "http://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png").removeAttr("hidden");
                    $("#day" + index).find("#forecast-temp").text("Temp: " + item.temp.day + " \xB0F");
                    $("#day" + index).find("#forecast-humidity").text("Humidity: " + item.humidity + "%");
                }
            });

            $("#city-name").text(city);
            $("#date").text(moment().format("l"));

            if (!cityArray.find(function(item) { return item.city === city;})) {
                cityArray.push({city: city, lastVisited: true});
                addCityToPage(city);
            }
        
            cityArray.forEach(function(item, index) {
                if (item.city != city) {
                    item.lastVisited = false;
                }
                else {
                    item.lastVisited = true;
                }
            });
        
            localStorage.setItem("weather", JSON.stringify(cityArray));            
        });
    });
}

function processCityButton(event) {
    event.preventDefault();
    var city = $(this).attr("data-city");
    console.log(city);
    getWeatherInfo(city);
}

function processInput(event) {
    event.preventDefault();
    var city = $("#input-city").val().toLowerCase();
    city = city[0].toUpperCase() + city.substring(1, city.length);
    console.log(city);
    getWeatherInfo(city);
}

$(document).ready(function() {
    cityArray = JSON.parse(localStorage.getItem("weather"));
    if (cityArray) {
        cityArray.forEach(function(item, index) {
            addCityToPage(item.city);
            if (item.lastVisited === true) {
                getWeatherInfo(item.city);
            }
        });
    }
    else {
        cityArray = [];
    }

    $("#city-search-button").on("click", processInput);
});
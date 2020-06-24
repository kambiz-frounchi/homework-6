var apiKey = "appid=9b4d2a99fd5695a6f9d466d71178ca21";
var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?";
var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?";
var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?";

$(document).ready(function() {
    $("#city-search-button").on("click", function(event) {
        event.preventDefault();
        var city = $("#input-city").val();
        console.log(city);
        $("#city-name").text(city);
        $("#date").text(moment().format("l"));
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
                $("#uv-index").text("UV Index: " + response.value);
            });
    
            query = forecastURL + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=imperial";
            $.ajax({url: query, method: "GET"}).then(function(response) {
                console.log(response)
                $("#five-day-label").text("5-Day Forecast:");

                response.daily.forEach(function(item, index) {
                    if ((index > 0) && (index < 6)) {
                        $("#day" + index).find("#forecast-date").text(moment.utc(item.dt).format("l"));
                        $("#day" + index).find("#forecast-icon").attr("src", "http://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png").removeAttr("hidden");
                        $("#day" + index).find("#forecast-temp").text("Temp: " + item.temp.day + " \xB0F");
                        $("#day" + index).find("#forecast-humidity").text("Humidity: " + item.humidity + "%");
                    }
                });
            });
        });
    });
});
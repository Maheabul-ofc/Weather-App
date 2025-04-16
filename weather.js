// API Key and Base URL
const apiKey = 'e37cc8b8daf84f63951162539251503';
const apiUrl = 'http://api.weatherapi.com/v1/forecast.json?key=' + apiKey + '&q=';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initial load with default city
    getWeather('Assam');

    // Search button event listener
    const btn = document.querySelector('#button');
    btn.addEventListener('click', () => {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            getWeather(city);
        }
    });
});

function getWeather(city) {
    fetch(apiUrl + city + '&days=7&aqi=no')
        .then(response => {
            if (!response.ok) throw new Error('City not found or API error');
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data); // Debug log
            updateCurrentWeather(data);
            updateWeeklyForecast(data);
            setBackgroundAndTheme(data);
            createHourlyGraph(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again.');
        });
}

function updateCurrentWeather(data) {
    const cityName = document.getElementById('city-name');
    const dateTime = document.getElementById('date-time');
    const temperature = document.getElementById('temperature');
    const weatherCondition = document.getElementById('weather-condition');
    const wind = document.getElementById('wind');
    const humidity = document.getElementById('humidity');
    document.getElementById('weatherIcon').src = `https:${data.current.condition.icon}`; // Use API icon

    cityName.textContent = `${data.location.name}, ${data.location.country}`;
    const currentDate = new Date(data.location.localtime);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    dateTime.textContent = `${dayName}, ${formattedDate}`;
    temperature.textContent = `${data.current.temp_c}°C`;
    weatherCondition.textContent = data.current.condition.text;
    wind.textContent = `${data.current.wind_kph} km/h`;
    humidity.textContent = `${data.current.humidity}%`;
}

// Update weekly forecast with icons
function updateWeeklyForecast(data) {
    const weeklyForecast = document.getElementById('weekly-forecast') || document.createElement('div');
    weeklyForecast.id = 'weekly-forecast';
    weeklyForecast.innerHTML = '';
    const forecastDays = data.forecast.forecastday;
    forecastDays.forEach(day => {
        const div = document.createElement('div');
        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
        const condition = day.day.condition.text.toLowerCase();
        let iconUrl = getWeatherIcon(condition);
        div.innerHTML = `
            <img src="${iconUrl}" alt="${condition} icon">
            <p>${dayName}</p>
            <p>${day.day.avgtemp_c}°C</p>
            <p>${day.day.condition.text}</p>

        `;
        weeklyForecast.appendChild(div);
    });
    if (!document.getElementById('weekly-forecast')) {
        document.querySelector('.container').appendChild(weeklyForecast);
    }
}

function setBackgroundAndTheme(data) {
    const container = document.getElementById('weather-container');
    const condition = data.current.condition.text.toLowerCase();
    container.className = 'container'; // Reset classes
    if (condition.includes('sunny')) container.classList.add('sunny');
    else if (condition.includes('rain')) container.classList.add('rainy');
    else if (condition.includes('storm') || condition.includes('thunder')) container.classList.add('storm');
    else container.classList.add('cloudy');

    const hour = new Date(data.location.localtime).getHours();
    if (hour >= 6 && hour < 18) {
        container.classList.add('light-theme');
    } else {
        container.classList.remove('light-theme');
    }
}

function createHourlyGraph(data) {
    const hourlyData = data.forecast.forecastday[0].hour;
    const labels = hourlyData.map(hour => new Date(hour.time).getHours() + ':00');
    const temperatures = hourlyData.map(hour => hour.temp_c);

    const ctx = document.getElementById('hourlyGraph').getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found for #hourlyGraph');
        return;
    }

    // Destroy previous chart if it exists
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Temperature (°C)' }
                },
                x: { title: { display: true, text: 'Hour' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    console.log('Chart created successfully');
}


// Function to get weather icon URL based on condition
function getWeatherIcon(condition) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    if (condition.includes('sunny')) return `${iconBaseUrl}01d@2x.png`; // Clear sky
    else if (condition.includes('rain') || condition.includes('shower')) return `${iconBaseUrl}09d@2x.png`; // Rain
    else if (condition.includes('cloudy') || condition.includes('overcast')) return `${iconBaseUrl}04d@2x.png`; // Clouds
    else if (condition.includes('storm') || condition.includes('thunder')) return `${iconBaseUrl}11d@2x.png`; // Thunderstorm
    return `${iconBaseUrl}01d@2x.png`; // Default to clear sky
}
const axios = require("axios");

let cachedCity = null;

// ipstack API key
const API_KEY = "3e72e716bbccf8b7f4a948c54f00576c";

function removeDiacritics(str) {
    // Normalize the string to decompose diacritic marks and remove them
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function getCityName() {
    try {
        if (cachedCity) {
            console.log("Using cached city:", cachedCity);
            return cachedCity;
            console.log(locationResponse.data);

        }

        // Fetch location details from ipstack
        const locationResponse = await axios.get(`http://api.ipstack.com/check?access_key=${API_KEY}`);
        let city = locationResponse.data.city;

        if (!city) {
            throw new Error("City name not found in API response.");
        }

        // Remove diacritics from the city name
        city = removeDiacritics(city);

        // Cache the city name
        cachedCity = city;
        console.log("Fetched and normalized city:", city);

        return city;
    } catch (error) {
        console.error("Error fetching city name:", error.message);

        if (error.response && error.response.status === 429) {
            console.error("Rate limit exceeded. Please wait before making further requests.");
        }
        return "Unknown City";
    }
}
module.exports = { getCityName };

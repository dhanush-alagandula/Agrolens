const mongoose = require("mongoose");
const imageschema = new mongoose.Schema({
    username: {
        type: String,
    },
    imagepath: {
        type: Array,
    },
    cityname: {
        type: Array,
    },
    disease: {
        type: Array,
    },
    confidence: {
        type: Array,
    }
});
const imagesdb = mongoose.model("images", imageschema);
module.exports = imagesdb;
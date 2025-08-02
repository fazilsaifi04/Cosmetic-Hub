const mongoose = require("mongoose");

const mondnUrl = "mongodb+srv://fazil9565:xj.ti82F5t4Lp4b@cluster0.pbl8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDb = () => {
    return mongoose.connect(mondnUrl);
}

module.exports = { connectDb };


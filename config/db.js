// Connects to MongoDB using the URI from .env (local MongoDB by default)
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clubhire";
  // give up after 5 s instead of the default 30 s if MongoDB isn't running
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected:", uri);
}

module.exports = connectDB;

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listening = require("../models/listing.js"); // ✅ not listings.js

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust1";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listening.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "688dde055e4875255136c1d5"
  }));
  await Listening.insertMany(initData.data); // ✅ correct reference
  console.log("data was initialized");
};

initDB();

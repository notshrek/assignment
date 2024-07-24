import mongoose from "mongoose";

// initialize database connection
async function init() {
  // connect to the MongoDB database and exit the app if connection is unsuccessful
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// define userSchema
const userSchema = new mongoose.Schema({
  username: String,
  joined_at: Number,
});

// compile userSchema into a model
export const User = mongoose.model("User", userSchema);

init();

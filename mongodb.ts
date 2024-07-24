import mongoose from "mongoose";

// initialize database connection
async function init() {
  // connect to the MongoDB database and exit the app if connection is unsuccessful
  try {
    await mongoose.connect(process.env.MONGODB_URL!, { autoIndex: true });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// define userSchema
// disable version key as it is not needed for this schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    joined_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// compile userSchema into a model
export const User = mongoose.model("User", userSchema);

init();

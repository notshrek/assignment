import express from "express";

const router = express.Router();

router.get("/users", (req, res) => {
  res.send("users");
});

export default router;

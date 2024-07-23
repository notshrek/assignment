import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger";

const router = express.Router();

// add swagger api docs route
router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(swaggerDocument));

router.get("/users", (req, res) => {
  res.send("users");
});

export default router;

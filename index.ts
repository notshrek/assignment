import express from "express";
import router from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger";
import "./mongodb";

const app = express();
const port = 3000;

// parse request body as json
app.use(express.json());

// add swagger api docs route
app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerDocument));

app.use("/api/v1", router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

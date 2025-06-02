import express from "express";
import cors from "cors";
import router from "./core/router";
import { errorHandler } from "./core/http-errors";
import { usersMiddlewares } from "./users/middlewares";
import { Config } from "./core/config";

export const apiVersion = "1.0.0";
const app: express.Express = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }),
);
app.use(express.static("uploads"));
app.use(express.json());
app.use(usersMiddlewares.authenticate);

app.use("/api/v1", router);
app.use(errorHandler);
app.listen(Config.SERVER_PORT, Config.SERVER_HOST, () => {
  console.log(
    `Server is running on http://${Config.SERVER_HOST}:${Config.SERVER_PORT}`,
  );
});

import express from "express";
import cors from "cors";
import router from "./core/router";
import { errorHandler } from "./core/http-errors";
import { usersMiddlewares } from "./users/middlewares";

export const apiVersion = "1.0.0";
const app: express.Express = express();

const HOST = "192.168.0.115";
const PORT = Number(process.env.PORT) || 8000;

app.use(express.json());
app.use(
    cors({
        origin: "exp://192.168.0.115:8081",
        methods: ["GET", "POST"],
    }),
);
app.use(express.json());
app.use(usersMiddlewares.authenticate);

app.use("/api/v1", router);
app.use(errorHandler);
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

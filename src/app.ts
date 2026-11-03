import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config";
import router from "./app/routes";
import notFound from "./app/middleware/notFound";
import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.client_url, credentials: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Doctor Tracker API is running" });
});

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
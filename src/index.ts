import cors from "cors";
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import {errorMiddleware} from "./middlewares/error";
import router from "./router";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("static"));
app.use(cookieParser());
app.use(cors({credentials: true}));
app.use("/api", router);

// Error handler
app.use(errorMiddleware);

const server = app.listen(PORT, async () => {
	console.log(`Server started on port ${PORT}`);
});

export {server};

export default app;

import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

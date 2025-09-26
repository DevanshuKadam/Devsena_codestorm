import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
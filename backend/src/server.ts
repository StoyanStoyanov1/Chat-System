import "dotenv/config";
import express from "express";
import {pool} from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());



async function sartServer() {
    try {
        await pool.query("SELECT 1");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("Database connection successful");
        });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        await pool.end();
        process.exit(1);
    }
}

void sartServer();
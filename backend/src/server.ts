import "dotenv/config";
import express from "express";
import {pool} from "./config/db.js";
import {countryRoutes} from "./routes"
import { connectRedis } from "./config/redis.js";

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());

app.use("/countries", countryRoutes);

async function sartServer() {
    try {
        await pool.query("SELECT 1");
        await connectRedis();
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
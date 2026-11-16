import "dotenv/config";
import express from "express";
import {pool} from "./config/db.js";
import { countryRoutes } from "./routes/index.js";
import { connectRedis } from "./config/redis.js";
import { httpLogger } from "./middleware/httpLogger.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = Number(process.env.PORT);


app.use(express.json());
app.use(httpLogger);
app.use(express.json());
app.use("/countries", apiRateLimiter, countryRoutes);

app.use(errorHandler);
async function sartServer() {
    try {
        await pool.query("SELECT 1");
        await connectRedis();
        logger.info("Redis connected");
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to start server");
        await pool.end();
        process.exit(1);
    }
}

void sartServer();
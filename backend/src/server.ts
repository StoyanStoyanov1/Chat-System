
import { app } from "./app.js";
import { pool } from "./config/db.js";
import { logger } from "./config/logger.js";

const PORT = Number(process.env.PORT ?? 5001);

async function startServer(): Promise<void> {
  try {
    await pool.query("SELECT 1");

    logger.info("PostgreSQL connected");

    app.listen(PORT, () => {
      logger.info(
        { port: PORT },
        "Server running"
      );
    });
  } catch (error) {
    logger.fatal(
      { err: error },
      "Failed to start server"
    );

    await pool.end();
    process.exit(1);
  }
}

void startServer();

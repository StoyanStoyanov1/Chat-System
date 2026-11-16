
import { config } from "dotenv";

config({
  path: ".env.test",
  override: true,
});

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!databaseUrl || !redisUrl) {
  throw new Error(
    "Test DATABASE_URL and REDIS_URL are required"
  );
}

const databaseName = decodeURIComponent(
  new URL(databaseUrl).pathname.slice(1)
);

const redisDatabase = new URL(redisUrl).pathname;

if (databaseName !== "hotel_workforce_test") {
  throw new Error(
    "Refusing to run tests outside hotel_workforce_test"
  );
}

if (redisDatabase !== "/1") {
  throw new Error(
    "Tests must use Redis database 1"
  );
}

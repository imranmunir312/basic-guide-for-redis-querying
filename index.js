import {
  createClient,
  AggregateSteps,
  AggregateGroupByReducers,
  SchemaFieldTypes,
} from "redis";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on("error", (err) => console.log("Redis Client Error: ", err));

await client.connect();

// querying documents with Limit
const value = await client.ft.search("idx:best_performers", "*", {
  LIMIT: {
    from: 0,
    size: 10,
  },
  SORTBY: {
    BY: "priceChangePercent",
    DIRECTION: "desc",
  },
});

console.log("TOP 10 Best Performers: ", JSON.stringify(value), "\n\n");

// querying specific documents
const coins = await client.ft.search(
  "idx:best_performers",
  `@symbol:EGLDUSDT`,
  {
    RETURN: ["symbol", "priceChange"],
  }
);

console.log("GET COIN BY SYMBOL: ", JSON.stringify(coins), "\n\n");

const singleCoin = await client.json.get("coin:0");

console.log(
  "GET SINGLE DOCUMENT BY DOCUMENT_ID: ",
  JSON.stringify(singleCoin),
  "\n\n"
);

// Aggregation Example
const aggregatedResults = await client.ft.aggregate(
  "idx:best_performers",
  "*",
  {
    STEPS: [
      {
        expression: "@pricechangePercent:[1 40]",
      },
    ],
  }
);

console.log("AGGREGATED RESULT: ", JSON.stringify(aggregatedResults));

await client.disconnect();

import { drizzle } from "drizzle-orm/node-postgres";
import databaseString from "./lib/databaseString";
import "dotenv/config";

export const db = drizzle(databaseString());

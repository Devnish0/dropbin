import { drizzle } from "drizzle-orm/node-postgres";
import databaseString from "./helper/databaseString";
import "dotenv/config";

export const db = drizzle(databaseString());
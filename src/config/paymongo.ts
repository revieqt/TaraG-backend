import axios from "axios";
import { PAYMONGO_SECRET_KEY } from "./apiKeys";

// Preconfigured Axios client for PayMongo
export const paymongoClient = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  headers: {
    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
    "Content-Type": "application/json",
  },
});

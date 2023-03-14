import sqlite from "better-sqlite3";
import session from "express-session";

const SqliteStore = require("better-sqlite3-session-store")(session);
const db = new sqlite("sessions.db");

export default new SqliteStore({
  client: db,
});

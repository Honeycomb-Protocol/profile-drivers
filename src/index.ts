import session from "express-session";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import routes from "./controllers";
import * as models from "./models";
import { connectDB } from "./utils";
import { Request } from "./types";
import config, { getHoneycomb } from "./config";
import { buildEntityRoute } from "./controllers/entity";
import sessionStore from "./session-store";
import { refreshData, startSocket } from "./sockets";

dotenv.config();

const app = express();
const port = config.port;

app.use(
  cors({
    origin: ["https://profiles.honeycombprotocol.com", "http://localhost:3000"],
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.static("/"));

app.use(express.json({ limit: config.request_limit }));
app.use(
  express.urlencoded({
    limit: config.request_limit,
    extended: true,
  })
);

app.use("/check", (_, res) => res.status(200).send("Server Running..."));
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    // cookie: { secure: true },
  })
);

(async () => {
  const honeycomb = await getHoneycomb("solpatrol");
  const orm = await connectDB(honeycomb.project().address.toString() + "_db");

  app.use((req: Request, _res, next) => {
    req.orm = orm;
    req.honeycomb = honeycomb;
    next();
  });

  honeycomb.project().profileDataConfig.forEach((config, label) => {
    if (config.__kind === "Entity") {
      const capitalizeLabel = label[0].toUpperCase() + label.slice(1);
      //@ts-ignore
      if (!models[capitalizeLabel])
        throw new Error(
          `${capitalizeLabel} entity does not have a defined model`
        );

      //@ts-ignore
      app.use("/entity/" + label, buildEntityRoute(models[label]));
    }
  });

  startSocket(honeycomb, orm);
  refreshData(honeycomb, orm);

  app.use(routes);

  app.listen(port, () => {
    console.log(colors.green(`[server] Listening on port ${port}`));
  });
})();

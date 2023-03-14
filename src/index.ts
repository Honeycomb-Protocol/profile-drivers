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
import config, { getHoneycomb, twitterClient } from "./config";
import { buildEntityRoute } from "./controllers/entity";
import sessionStore from "./session-store";
import { refreshData, startSocket } from "./sockets";
import crons from "./crons";

dotenv.config();

const app = express();
const port = config.port;

app.use(cors());

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
  const orm = await connectDB(config.db_name);
  const honeycomb = await getHoneycomb("devnet");
  const twitter = twitterClient();

  app.use((req: Request, _res, next) => {
    req.orm = orm;
    req.honeycomb = honeycomb;
    req.twitter = twitter;
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

  refreshData(honeycomb, orm, twitter).then((_) => startSocket(honeycomb, orm));

  app.use(routes);
  crons();

  app.listen(port, () => {
    console.log(colors.green(`[server] Listening on port ${port}`));
  });

  (async () => {
    await orm.getMigrator().up();
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    await orm.getMigrator().down();
    const countUser = await orm.em.count(models.Profile);
    const countStats = await orm.em.count(models.Stats);
    // const countWallet = await orm.em.count(models.Wallet);
    console.log({ countUser, countStats });
    // if (countUser == 0) {
    //   await orm.em.insert(models.Profile, {
    //     address: new PublicKey("11111111111111111111111111111111"),
    //     useraddress: new PublicKey("11111111111111111111111111111114"),
    //     wallets: Wallets.from({
    //       primary_wallet: new PublicKey("11111111111111111111111111111112"),
    //       secondary_wallets: [
    //         new PublicKey("11111111111111111111111111111113"),
    //       ],
    //     }),
    //   });
    // }
    // if (!countWallet) {
    //   await orm.em.insertMany(models.Wallet, [
    //     {
    //       profile: new PublicKey("11111111111111111111111111111111"),
    //       address: new PublicKey("11111111111111111111111111111112"),
    //       isPrimary: true,
    //     },
    //     {
    //       profile: new PublicKey("11111111111111111111111111111111"),
    //       address: new PublicKey("11111111111111111111111111111113"),
    //       isPrimary: false,
    //     },
    //   ]);
    // }
    // if (!countStats) {
    //   await orm.em.insertMany(models.Stats, [
    //     new models.Stats(
    //       [new PublicKey("11111111111111111111111111111111"), 0],
    //       1,
    //       1
    //     ),
    //     new models.Stats(
    //       [new PublicKey("11111111111111111111111111111111"), 1],
    //       1,
    //       1
    //     ),
    //     new models.Stats(
    //       [new PublicKey("11111111111111111111111111111111"), 2],
    //       1,
    //       1
    //     ),
    //     new models.Stats(
    //       [new PublicKey("11111111111111111111111111111111"), 3],
    //       1,
    //       1
    //     ),
    //   ]);
    // }
  })();
})();

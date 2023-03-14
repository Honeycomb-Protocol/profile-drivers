import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { PublicKey } from "@solana/web3.js";
import colors from "colors";
import routes from "./controllers";
import * as models from "./models";
import { connectDB } from "./utils";
import { Request } from "./types";
import { getHoneycomb } from "./config";
import { buildEntityRoute } from "./controllers/entity";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

app.use(morgan("dev"));

app.use(express.static("/"));

app.use(express.json({ limit: process.env.REQUEST_LIMIT }));
app.use(
  express.urlencoded({
    limit: process.env.REQUEST_LIMIT,
    extended: true,
  })
);

app.use("/check", (_, res) => res.status(200).send("Server Running..."));

(async () => {
  const orm = await connectDB(process.env.DB_NAME || "database_tmp");
  const honeycomb = await getHoneycomb("devnet");

  (async () => {
    const countUser = await orm.em.count(models.User);
    const countStats = await orm.em.count(models.Stats);
    const countWallet = await orm.em.count(models.Wallet);
    console.log({ countUser, countStats, countWallet });
    if (countUser == 0) {
      await orm.em.insert(models.User, {
        address: new PublicKey("11111111111111111111111111111111"),
      });
    }
    if (!countWallet) {
      await orm.em.insertMany(models.Wallet, [
        {
          user: new PublicKey("11111111111111111111111111111111"),
          address: new PublicKey("11111111111111111111111111111112"),
          isPrimary: true,
        },
        {
          user: new PublicKey("11111111111111111111111111111111"),
          address: new PublicKey("11111111111111111111111111111113"),
          isPrimary: false,
        },
      ]);
    }
    if (!countStats) {
      await orm.em.insertMany(models.Stats, [
        new models.Stats(
          [new PublicKey("11111111111111111111111111111111"), 0],
          1,
          1
        ),
        new models.Stats(
          [new PublicKey("11111111111111111111111111111111"), 1],
          1,
          1
        ),
        new models.Stats(
          [new PublicKey("11111111111111111111111111111111"), 2],
          1,
          1
        ),
        new models.Stats(
          [new PublicKey("11111111111111111111111111111111"), 3],
          1,
          1
        ),
      ]);
    }
  })();

  app.use((req: Request, _res, next) => {
    req.orm = orm;
    req.honeycomb = honeycomb;
    next();
  });

  const entities: string[] = [];
  honeycomb.project().profileDataConfig.forEach((config, label) => {
    if (config.__kind === "Entity") {
      //@ts-ignore
      if (!models[label])
        throw new Error(`${label} entity does not have a defined model`);
      entities.push(label);

      //@ts-ignore
      app.use("/entity/" + label, buildEntityRoute(models[label]));
    }
  });

  app.listen(port, () => {
    console.log(colors.green(`[server] Listening on port ${port}`));
  });
})();

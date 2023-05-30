import cron from "node-cron";

import { Honeycomb } from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/sqlite";
import { refreshData, startSocket } from "../sockets";

export default function (honeycomb: Honeycomb, orm: MikroORM) {
  cron.schedule("* * 3 * * *", () => {
    console.log("cron job working")
    refreshData(honeycomb, orm).then(() => startSocket(honeycomb, orm));
  });
}

import { Honeycomb } from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Request as ExpressRequest } from "express";
import SteamAuth from "node-steam-openid";

export type IResponse<T = any> = {
  success: boolean;
  code: number;
  message: string;
  data?: T;
};

export type Request = ExpressRequest & {
  orm?: MikroORM<SqliteDriver>;
  honeycomb?: Honeycomb;
  steam?: SteamAuth;
  profile?: any;
  session?: any;
  user?: any
};

import { Honeycomb } from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Request as ExpressRequest } from "express";

export type IResponse<T = any> = {
  success: boolean;
  code: number;
  message: string;
  data?: T;
};

export type Request = ExpressRequest & {
  orm?: MikroORM<SqliteDriver>;
  honeycomb?: Honeycomb;
  profile?: any;
  session?: any;
};

import * as web3 from "@solana/web3.js";
import fs from "fs";
import dotenv from "dotenv";
import { Project } from "./types";
import {
  Honeycomb,
  HoneycombProject,
  identityModule,
} from "@honeycomb-protocol/hive-control";
import Twitter from "twitter-lite";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT || 4000,
  cors_origin: process.env.CORS_ORIGIN || "*",
  request_limit: process.env.REQUEST_LIMIT || "100kb",
  jwt_secret: process.env.JWT_SECRET || "secret",
  rpc_url: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  db_name: process.env.DB_NAME || "temp",

  twitter_consumer_key: process.env.TWITTER_API_KEY,
  twitter_consumer_secret: process.env.TWITTER_SECRET,
  twitter_access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  twitter_access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  twitter_bearer_token: process.env.TWITTER_BEARER_TOKEN,
} as { [k: string]: string };
export default config;

export const projects = JSON.parse(
  fs.readFileSync("./projects.json").toString()
);
export async function getHoneycomb(
  projectName: string,
  opts?: web3.ConfirmOptions
) {
  const project: Project = projects[projectName];
  if (!project) throw new Error("Project not found");

  const RPC = project.rpc || config.rpc_url;

  if (!opts) {
    opts = {
      commitment: "processed",
      skipPreflight: false,
    };
  }

  const honeycomb = new Honeycomb(new web3.Connection(RPC, opts));
  honeycomb.use(
    identityModule(web3.Keypair.fromSecretKey(Uint8Array.from(project.driver)))
  );
  honeycomb.use(
    await HoneycombProject.fromAddress(
      honeycomb.connection,
      new web3.PublicKey(project.address)
    )
  );

  return honeycomb;
}

export function twitterClient() {
  return new Twitter({
    subdomain: "api",
    version: "2",
    extension: false,
    consumer_key: config.twitter_consumer_key,
    consumer_secret: config.twitter_consumer_secret,
    // bearer_token: config.twitter_bearer_token,
    access_token_key: config.twitter_access_token_key,
    access_token_secret: config.twitter_access_token_secret,
  });
}

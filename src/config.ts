import * as web3 from "@solana/web3.js";
import fs from "fs";
import dotenv from "dotenv";
import { Project } from "./types";
import {
  Honeycomb,
  HoneycombProject,
  httpModule,
  identityModule,
} from "@honeycomb-protocol/hive-control";
import SteamAuth from "node-steam-openid";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT || 4001,
  honeycomb_env: process.env.HONEYCOMB_ENV || "dev",
  cors_origin: process.env.CORS_ORIGIN || "*",
  request_limit: process.env.REQUEST_LIMIT || "100kb",
  jwt_secret: process.env.JWT_SECRET || "secret",
  rpc_url: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  db_name: process.env.DB_NAME || "temp",
  steam_api_key: process.env.STEAM_API_KEY || process.exit(1),
  dev_env: process.env.DEV_ENV == "true" || false,
};
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

  const honeycomb = new Honeycomb(new web3.Connection(RPC, opts), {
    env: config.honeycomb_env,
  });
  honeycomb.use(
    identityModule(web3.Keypair.fromSecretKey(Uint8Array.from(project.driver)))
  );
  honeycomb.use(
    await HoneycombProject.fromAddress(
      honeycomb.connection,
      new web3.PublicKey(project.address)
    )
  );

  honeycomb.use(httpModule(""));

  return honeycomb;
}

export function steamClient() {
  return new SteamAuth({
    realm: config.dev_env
      ? "http://localhost:3000/"
      : "https://profiles.honeycombprotocol.com/", // Site name displayed to users on logon
    returnUrl: config.dev_env
      ? "http://localhost:3000/edit/profiles/steam/callback"
      : "https://profiles.honeycombprotocol.com/edit/profiles/steam/callback", // Your return route
    apiKey: config.steam_api_key, // Steam API key
  });
}

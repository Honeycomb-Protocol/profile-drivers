import * as web3 from "@solana/web3.js";
import fs from "fs";
import dotenv from "dotenv";
import { Project } from "./types";
import {
  Honeycomb,
  HoneycombProject,
  identityModule,
} from "@honeycomb-protocol/hive-control";

dotenv.config();

export const PROD = process.env.PROD === "true";

const IDL: any = {};

const devnetRpc = "https://api.devnet.solana.com";
const mainnetdRpc =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

const projects = JSON.parse(fs.readFileSync("./projects.json").toString());

export async function getHoneycomb(
  projectName: string,
  opts?: web3.ConfirmOptions
) {
  const project: Project = projects[projectName];
  if (!project) throw new Error("Project not found");

  const RPC =
    project.rpc || (projectName !== "devnet" ? mainnetdRpc : devnetRpc);

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

import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import fs from "fs";
import dotenv from "dotenv";
import { Project, Missions, MissionsIDL } from "./types";
import {
  Honeycomb,
  HoneycombProject,
  identityModule,
} from "@honeycomb-protocol/hive-control";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV,
  honeycomb_env: process.env.HONEYCOMB_ENV || "main",
  port: process.env.PORT || 4000,
  cors_origin: process.env.CORS_ORIGIN || "*",
  request_limit: process.env.REQUEST_LIMIT || "100kb",
  jwt_secret: process.env.JWT_SECRET || "secret",
  rpc_url: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  db_name: process.env.DB_NAME || "temp",
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
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

  return honeycomb;
}

export const getMissionsProgram = (honeycomb: Honeycomb) => {
  const provider = new anchor.AnchorProvider(
    honeycomb.connection,
    honeycomb.identity(),
    {
      preflightCommitment: "confirmed",
    }
  );

  const program = new anchor.Program<Missions>(
    MissionsIDL,
    new web3.PublicKey(
      honeycomb.cluster === "devnet"
        ? "GcH5bF7WpUfAF5TjdKNPbetUvKCJdeZ65AnaYVxwpiha"
        : "HkoqNP2KcgiH5bzWWaSUFA8AsGyb7M9zRyJEhKnezSrv"
    ),
    provider
  );

  return {
    missionsCoder: new anchor.BorshAccountsCoder(program.idl),
    missionsProgram: program,
    missionsKey: new web3.PublicKey(
      honeycomb.cluster === "devnet"
        ? "CWoCehkYMbZmnTxJne8LaQx58J8qDHVYFHyi5nHHwSeF"
        : "9hk4HB85mKJHs2pbx2RpDZGeMjTsKhjknf7ibzFwCvmA"
    ),
  };
};

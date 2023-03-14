import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import config from "../config";
import { Token } from "../types";

dotenv.config();

export const create_token = (payload: Token): string =>
  jwt.sign(payload, config.jwt_secret);

export const verify_token = (token: string): Token | undefined => {
  try {
    return jwt.verify(token, config.jwt_secret) as Token;
  } catch (e) {
    return undefined;
  }
};

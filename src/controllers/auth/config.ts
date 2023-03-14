import * as dotenv from "dotenv";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  cors_origin: process.env.CORS_ORIGIN,
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_Secret,
  access_token_key: process.env.TWITTER_Access_Token,
  access_token_secret: process.env.TWITTER_Access_Token_Secret,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
} as { [k: string]: string };

export default config;

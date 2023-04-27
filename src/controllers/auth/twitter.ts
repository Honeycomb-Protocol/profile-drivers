import * as web3 from "@solana/web3.js";
import express, { Response } from "express";
import { Request } from "../../types";
import Twitter, { OauthToken, OauthTokenSecret } from "twitter-lite";
import config from "../../config";
import { ResponseHelper } from "../../utils";
import { Profile } from "../../models";
import { authenticate } from "../../middlewares";
import { IdentityProfile } from "@honeycomb-protocol/hive-control";
import { fetchAndSaveSingleProfileByUserAddress } from "../../sockets";

const router = express.Router();

router.post("/", authenticate, async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);
  if (!req.user || !req.twitter)
    return response.notFound("web3User not found in session.");
  try {
    const twRequestToken = (await req.twitter.getRequestToken(
      config.frontend_url + "/twitter/callback"
    )) as {
      oauth_token: OauthToken;
      oauth_token_secret: OauthTokenSecret;
    };

    req.session.twRequestToken = twRequestToken;
    response.ok(undefined, {
      twitterUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${twRequestToken.oauth_token}`,
    });
  } catch (err: any) {
    console.error(err);
    response.error(err.errors[0]?.message);
  }
});
router.post("/callback", authenticate, async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);

  if (!req.user || !req.orm || !req.honeycomb || !req.twitter)
    return response.notFound("web3User not found in session.");

  let profile = await req.orm.em.findOne(Profile, {
    useraddress: req.user.address,
  });

  let profileChain: IdentityProfile;
  if (!profile) {
    profile = await fetchAndSaveSingleProfileByUserAddress(
      req.honeycomb,
      new web3.PublicKey(req.user.address),
      req.orm
    );

    if (!profile) {
      return response.notFound("Profile not found!");
    }
  }

  if (profile.twitterId || profile.twitterUsername) {
    return response.conflict(
      "Twitter credentials already set for this profile"
    );
  }

  try {
    const { oauth_verifier, oauth_token } = req.query as {
      [k: string]: string;
    };

    delete req.session.twRequestToken;

    const accessToken = await req.twitter.getAccessToken({
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
    });
    const userClient = new Twitter({
      access_token_key: accessToken.oauth_token,
      access_token_secret: accessToken.oauth_token_secret,
      consumer_key: config.twitter_consumer_key,
      consumer_secret: config.twitter_consumer_secret,
    });
    const user = await userClient.get("account/verify_credentials");

    profileChain = await req.honeycomb
      .identity()
      .fetch()
      .profile(
        req.honeycomb.project().address,
        new web3.PublicKey(profile.useraddress),
        profile.identity
      );

    await profileChain
      .add("twitterUsername", user.screen_name)
      .then((_) => {
        profile && (profile.twitterUsername = user.screen_name);
      })
      .catch();

    await profileChain
      .add("twitterId", user.id_str)
      .then((_) => {
        profile && (profile.twitterId = user.id_str);
      })
      .catch();

    req.session.twUser = user;
    await req.orm.em.flush();

    // await fetchAllEntitiesFor(req.honeycomb, req.orm, req.twitter, profile);

    response.ok("Tw Auth Success!");
  } catch (err: any) {
    console.error("Twitter Callback", err);
    return response.error(err.message);
  }
});

export default router;

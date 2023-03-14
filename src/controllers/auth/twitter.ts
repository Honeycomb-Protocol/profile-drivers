import express, { Response } from "express";
import { Request } from "../../types";
import Twitter, { OauthToken, OauthTokenSecret } from "twitter-lite";
import config from "../../config";
import { ResponseHelper } from "../../utils";
import { Profile, Wallets } from "../../models";
import { fetchAllEntitiesFor } from "../../sockets";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);

  if (!req.session.web3User || !req.twitter)
    return response.error("web3User not found in session.");
  try {
    const twRequestToken = (await req.twitter.getRequestToken(
      "http://127.0.0.1:3000/twitter/auth/callback"
    )) as {
      oauth_token: OauthToken;
      oauth_token_secret: OauthTokenSecret;
    };

    console.log("twRequestToken", twRequestToken);
    req.session.twRequestToken = twRequestToken;
    res.redirect(
      `https://api.twitter.com/oauth/authenticate?oauth_token=${twRequestToken.oauth_token}`
    );
  } catch (err: any) {
    console.error(err);
    response.error(err.message);
  }
});
router.get("/callback", async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);

  if (!req.session.web3User || !req.orm || !req.honeycomb || !req.twitter)
    return response.error("web3User not found in session.");

  const profile = await req.orm.em.findOne(Profile, {
    address: req.session.web3User.address,
  });

  if (!profile) {
    return response.error("Profile not found!");
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
    // const twRequestToken = req.session.twRequestToken;
    console.log("this,is,data", req.session.twRequestToken);
    delete req.session.twRequestToken;
    const accessToken = await req.twitter.getAccessToken({
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
    });
    const userClient = new Twitter({
      access_token_key: accessToken.oauth_token,
      access_token_secret: accessToken.oauth_token_secret,
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
    });
    const user = await userClient.get("account/verify_credentials");

    //@ts-ignore
    const { primary_wallet } = Wallets.parse(profile.wallets);
    const profileChain = await req.honeycomb
      .identity()
      .fetch()
      .profile(req.honeycomb.project().address, primary_wallet);

    await profileChain
      .add("twitterUsername", user.screen_name)
      .then((_) => {
        profile.twitterId = user.id_str;
      })
      .catch();

    await profileChain
      .add("twitterId", user.id_str)
      .then((_) => {
        profile.twitterUsername = user.screen_name;
      })
      .catch();

    req.session.twUser = user;
    await req.orm.em.flush();

    await fetchAllEntitiesFor(req.honeycomb, req.orm, req.twitter, profile);

    response.ok("Tw Auth Success!");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
// router.get("/", (req: Request, res: Response) => {
//   if (req.session.user) {
//     res.send("You are logged in as " + req.session.user.name);
//   } else {
//     res.send("Please log in");
//   }
// });

export default router;

import { PopulateHint } from "@mikro-orm/core";
import express, { Handler } from "express";
import { Profile, SteamFriend, SteamOwnedGames, Wallets } from "../models";
import { Request } from "../types";
import { ResponseHelper } from "../utils";

const getFriends: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .find(SteamFriend, {
      profile: {
        $or: [
          {
            address: req.params.address,
          },
          {
            wallets: {
              $like: `%${req.params.address}%`
            }
          }
        ]
      }
    })
    .then((friends) => {
      if (!friends) return response.notFound();
      // const friendsNew = friends.toJSON();
      return response.ok(undefined, friends);
    })
    .catch((e) => response.error(e.message));
};
const getGames: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .find(SteamOwnedGames, {
      profile: {
        $or: [
          {
            address: req.params.address,
          },
          {
            wallets: {
              $like: `%${req.params.address}%`
            }
          }
        ]
      }
    }, {
      populate: ["steamGame"],
      populateWhere: PopulateHint.INFER,
    })
    .then((games) => {
      if (!games) return response.notFound();
      // const friendsNew = games.toJSON();
      return response.ok(undefined, games);
    })
    .catch((e) => response.error(e.message));
};

const router = express.Router();

router.get("/friends/:address", getFriends);
router.get("/games/:address", getGames);

export default router;

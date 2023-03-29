import { PopulateHint } from "@mikro-orm/core";
import express, { Handler } from "express";
import { Profile, SteamAchievements, SteamFriend, SteamOwnedGames, Wallets } from "../models";
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
    })
    .then((games) => {
      if (!games) return response.notFound();

      const total = games.reduce((acc, obj) => acc + obj.playtimeForever, 0);
      const average = total / games.length;
      // const friendsNew = games.toJSON();
      return response.ok(undefined, { games, averagePlayTimePerGame: `${(average / 60).toFixed(0)} H`, numberOfGamesPlayed: games.filter((item) => item.playtimeForever).length, totalPlayTime: `${(total / 60).toFixed(0)} H` });
    })
    .catch((e) => response.error(e.message));
};
const getGamesAchievements: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);
  return req.orm?.em
    .find(SteamAchievements, {
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
      },
      app_id: parseInt(req.params.gameId)
    }, {
      populate: ["steamGame"],
    })
    .then((games) => {
      if (!games) return response.notFound();
      const percentage = (games.filter(obj => obj.achieved === 1).length / games.length) * 100;

      console.log(percentage);
      return response.ok(undefined, { games, achievementProgress: `${(percentage).toFixed(2)}%` });
    })
    .catch((e) => response.error(e.message));
};

const router = express.Router();

router.get("/friends/:address", getFriends);
router.get("/games/:address", getGames);
router.get("/games/achievements/:address/:gameId", getGamesAchievements);

export default router;

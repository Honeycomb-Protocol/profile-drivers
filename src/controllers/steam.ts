import { PopulateHint } from "@mikro-orm/core";
import express, { Handler } from "express";
import { Profile, SteamAchievements, SteamFriend, SteamGame, SteamOwnedGames, Wallets } from "../models";
import { Request } from "../types";
import { ResponseHelper } from "../utils";
import { authenticate } from "../middlewares";

const getFriends: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .find(SteamFriend, {
      profile: {
        $or: [
          {
            useraddress: req.user.address,
          },
          {
            wallets: {
              $like: `%${req.user.address}%`
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
  console.log("req.user", req.user)
  return req.orm?.em
    .find(SteamOwnedGames, {
      profile: {
        $or: [
          {
            useraddress: req.user.address,
          },
          {
            wallets: {
              $like: `%${req.user.address}%`
            }
          }
        ]
      }
    }, {
      populate: ["steamGame", "app_id"],
    })
    .then((games) => {
      if (!games) return response.notFound();
      req.orm?.em.find(SteamGame, { app_id: games.map((item) => item.app_id) }).then((data) => {
        req.orm?.em.find(SteamAchievements, {
          profile: {
            $or: [
              {
                useraddress: req.user.address,
              },
              {
                wallets: {
                  $like: `%${req.user.address}%`
                }
              }
            ]
          }, app_id: games.map((item) => item.app_id)
        }).then((achievements) => {
          // merge the data
          let mergedData = games.map((item) => {
            const game = data.find((game) => game.app_id === item.app_id);
            const achievement = achievements.filter((achievement) => achievement.app_id === item.app_id) || {};
            if (game) return { ...item, ...game, achievements: achievement }
            else return item;
          });

          const total = games.reduce((acc, obj) => acc + obj.playtimeForever, 0);
          const average = total / games.length;
          // const friendsNew = games.toJSON();
          return response.ok(undefined, { games: mergedData, averagePlayTimePerGame: `${(average / 60).toFixed(0)} H`, numberOfGamesPlayed: games.filter((item) => item.playtimeForever).length, totalPlayTime: `${(total / 60).toFixed(0)} H` });
        });
      })
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
            useraddress: req.user.address,
          },
          {
            wallets: {
              $like: `%${req.user.address}%`
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

router.get("/friends", authenticate, getFriends);
router.get("/games", authenticate, getGames);
router.get("/games/achievements/:gameId", authenticate, getGamesAchievements);

export default router;

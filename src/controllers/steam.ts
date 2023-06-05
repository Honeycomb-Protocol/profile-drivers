import express, { Handler } from "express";
import {
  SteamAchievements,
  SteamFriend,
  SteamGame,
  SteamGamePlayerStat,
  SteamOwnedCollectible,
  SteamOwnedGames,
} from "../models";
import { Request } from "../types";
import { ResponseHelper } from "../utils";
import { authenticate } from "../middlewares";
import { SteamAssetClassInfo } from "../models/SteamAssetClassInfo";
import { SteamUser } from "../models/SteamUser";

const getFriends: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .find(SteamFriend, {
      profile: {
        $or: [
          {
            steamId: req.params.steamId,
          },
        ],
      },
    })
    .then(async (friends) => {
      let users = await req.orm?.em.find(SteamUser, {
        steamId: friends.map((item) => item.steamId),
      });
      if (!friends) return response.notFound();
      // const friendsNew = friends.toJSON();
      return response.ok(undefined, {
        friends: friends
          .map((item) => {
            let user = users?.find((user) => user.steamId === item.steamId);
            if (user) return { ...item, ...user };
            else return item;
          })
          .filter((e: any) => e.image),
      });
    })
    .catch((e) => response.error(e.message));
};
const getGames: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);
  return req.orm?.em
    .find(
      SteamOwnedGames,
      {
        profile: {
          $or: [
            {
              steamId: req.params.steamId,
            },
          ],
        },
      },
      {
        populate: ["steamGame", "app_id"],
      }
    )
    .then((games) => {
      if (!games) return response.notFound();
      req.orm?.em
        .find(SteamGame, { app_id: games.map((item) => item.app_id) })
        .then((data) => {
          req.orm?.em
            .find(SteamAchievements, {
              profile: {
                $or: [
                  {
                    steamId: req.params.steamId,
                  },
                ],
              },
              app_id: games.map((item) => item.app_id),
            })
            .then((achievements) => {
              req.orm?.em
                .find(SteamGamePlayerStat, {
                  profile: {
                    $or: [
                      {
                        steamId: req.params.steamId,
                      },
                    ],
                  },
                  app_id: games.map((item) => item.app_id),
                })
                .then((gameStats) => {
                  // merge the data
                  let mergedData = games.map((item) => {
                    const game = data.find(
                      (game) => game.app_id === item.app_id
                    );
                    const achievement =
                      achievements.filter(
                        (achievement) => achievement.app_id === item.app_id
                      ) || {};
                    const stats =
                      gameStats.filter((stat) => stat.app_id === item.app_id) ||
                      {};
                    if (game)
                      return {
                        ...item,
                        ...game,
                        achievements: achievement,
                        stats,
                      };
                    else return item;
                  });

                  const total = games.reduce(
                    (acc, obj) => acc + obj.playtimeForever,
                    0
                  );
                  const average = total / games.length;
                  // const friendsNew = games.toJSON();
                  return response.ok(undefined, {
                    games: mergedData,
                    averagePlayTimePerGame: `${(average / 60).toFixed(0)} H`,
                    numberOfGamesPlayed: games.filter(
                      (item) => item.playtimeForever
                    ).length,
                    totalPlayTime: `${(total / 60).toFixed(0)} H`,
                  });
                });
            });
        });
    })
    .catch((e) => response.error(e.message));
};
const getCollectibles: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);
  return req.orm?.em
    .find(
      SteamOwnedCollectible,
      {
        profile: {
          $or: [
            {
              steamId: req.params.steamId,
            },
          ],
        },
      },
      {
        populate: ["steamGame"],
      }
    )
    .then((collectibles) => {
      if (!collectibles) return response.notFound();
      const appIds = new Set(collectibles.map((item) => item.app_id));
      req.orm?.em
        .find(SteamAssetClassInfo, {
          app_id: Array.from(appIds),
        })
        .then((assets) => {
          if (!assets) return response.notFound();
          req.orm?.em
            .find(SteamGame, {
              app_id: Array.from(appIds),
            })
            .then((games) => {
              if (!games) return response.notFound();
              const Games = games.map((item) => {
                return {
                  ...item,
                  collectibles: collectibles.map((e) => {
                    const asset = assets.find(
                      (asset) => asset.app_id === item.app_id
                    );
                    if (asset) return { ...e, ...asset };
                    else return e;
                  }),
                };
              });

              // just want to add collectible and asset in to the game which are not duplicates

              return response.ok(undefined, {
                games: Games,
                totalValueOfInventory: collectibles.reduce(
                  (acc, obj) => acc + parseInt(obj.amount),
                  0
                ),
              });
            })
            .catch((e) => response.error(e.message));
        })
        .catch((e) => response.error(e.message));
    })
    .catch((e) => response.error(e.message));
};
const getGamesAchievements: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);
  return req.orm?.em
    .find(
      SteamAchievements,
      {
        profile: {
          $or: [
            {
              steamId: req.params.steamId,
            },
          ],
        },
        app_id: parseInt(req.params.gameId),
      },
      {
        populate: ["steamGame"],
      }
    )
    .then((games) => {
      if (!games) return response.notFound();
      const percentage =
        (games.filter((obj) => obj.achieved === 1).length / games.length) * 100;

      return response.ok(undefined, {
        games,
        achievementProgress: `${percentage.toFixed(2)}%`,
      });
    })
    .catch((e) => response.error(e.message));
};

const router = express.Router();

router.get("/friends/:steamId", authenticate, getFriends);
router.get("/games/:steamId", authenticate, getGames);
router.get("/games/collectibles/:steamId", authenticate, getCollectibles);
router.get(
  "/games/achievements/:steamId/:gameId",
  authenticate,
  getGamesAchievements
);

export default router;

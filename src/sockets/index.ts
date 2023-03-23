import { ISteamOwnedGames } from './../models/SteamOwnedGames';
import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  User as UserChain,
  Profile as ProfileChain,
  userDiscriminator,
  profileDiscriminator,
} from "@honeycomb-protocol/hive-control";
const puppeteer = require('puppeteer');

import config from '../config'
import { MikroORM } from "@mikro-orm/core";
import { ISteamFriend, ISteamGame, ISteamGameCollectible, Profile, SteamFriend, SteamGame, SteamOwnedCollectible, SteamOwnedGames, Wallets } from "../models";
import axios from "axios";
import { ISteamUser, SteamUser } from "../models/SteamUser";
import { SteamAssetClassInfo } from '../models/SteamAssetClassInfo';
import { ISteamGamePlayerStat, SteamGamePlayerStat } from '../models/SteamGamePlayerStat';
import { ISteamAcheivements, SteamAcheivements } from '../models/SteamAcheivements';
const testingUser = null;

interface ISteamOwnedGamesApi {
  "appid": number,
  "name": string,
  "playtime_forever": number,
  "img_icon_url": string,
  "playtime_windows_forever": number,
  "playtime_mac_forever": number,
  "playtime_linux_forever": number,
  "rtime_last_played": number
}

interface IAssetClassInfoApi {
  [key: string]: {
    "icon_url": string,
    "icon_url_large": string,
    "icon_drag_url": string,
    "name": string,
    "market_hash_name": string,
    "market_name": string,
    "name_color": string,
    "background_color": string,
    "type": string,
    "tradable": string,
    "marketable": string,
    "commodity": string,
    "market_tradable_restriction": string,
    "market_buy_country_restriction": string,
    "fraudwarnings": string,
    "descriptions": {
      [key: string]: {
        type: number,
        value: string,
        app_data: string
      }
    },
    "owner_descriptions": string,
    "tags": {
      [key: string]: {
        internal_name: string,
        name: string,
        category: string,
        category_name: string
      }
    },
    "classid": string
  },
}

interface ISteamGamePlayerStatApi {
  "steamID": string,
  "gameName": string,
  "stats": { name: string, value: number }[],
  "achievements": { name: string, achieved: number }[],
}

export async function saveProfile(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profileAddress: web3.PublicKey,
  profileChain: ProfileChain
) {
  let profile = await orm.em.findOne(Profile, {
    address: profileAddress,
  });

  if (!profile) {
    const userChain = await UserChain.fromAccountAddress(
      honeycomb.processedConnection,
      profileChain.user
    );

    profile = new Profile(profileAddress);
    profile.useraddress = profileChain.user;
    //@ts-ignore
    profile.wallets = Wallets.from({
      primary_wallet: userChain.primaryWallet,
      secondary_wallets: userChain.secondaryWallets,
    }).toString();

    orm.em.persist(profile);
  }

  const steamId = profileChain.data.get("steamId");
  if (steamId && steamId.__kind == "SingleValue") {
    profile.steamId = steamId.value;
  }

  const steamUsername = profileChain.data.get("steamUsername");
  if (steamUsername && steamUsername.__kind == "SingleValue") {
    profile.steamUsername = steamUsername.value;
  }

  await orm.em.flush();
  await fetchAllEntitiesFor(honeycomb, orm, profile);
}

export function fetchProfiles(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Refreshing Profiles...");
  return ProfileChain.gpaBuilder()
    .addFilter("project", honeycomb.project().address)
    .run(honeycomb.connection)
    .then((profilesChain) => {
      console.log(profilesChain.length);
      return Promise.all(
        profilesChain.map(async (profileChain) => {
          try {
            await saveProfile(
              honeycomb,
              orm,
              profileChain.pubkey,
              ProfileChain.fromAccountInfo(profileChain.account)[0]
            );
          } catch (e) {
            console.error(e);
          }
        })
      );
    });
}

const waiting = (ms = 1000): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}

export async function fetchFriendList(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
) {
  //@ts-ignore
  const { primary_wallet } = Wallets.parse(profile.wallets);
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(undefined, primary_wallet);
  const tree = profileObj.entity<ISteamFriend>("SteamFriend");
  tree.setLeaves(
    await orm.em
      .find(
        SteamFriend,
        {
          profile: {
            address: profile.address,
          },
        },
        {
          orderBy: {
            index: 1,
          },
        }
      )
      .then((rows) => rows.map((row) => row.toJSON() as ISteamFriend))
  );

  const steamId = profileObj.get("steamId");

  if (!steamId) return;
  const url = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${config.steam_api_key}&steamid=${testingUser || profile.steamId}&relationship=friend`
  const friendList = await honeycomb.http().get(url).then(res => {
    return (res.friendslist?.friends || []) as {
      "steamid": string,
      "relationship": string,
      "friend_since": number
    }[]
  })
  console.log(friendList)
  for (let friend of friendList) {
    let dataInDb = await orm.em.findOne(SteamFriend, {
      profile,
      steamId: friend.steamid,
    });
    const leave = tree.values.find((t) => t.steamId == friend.steamid);
    let index = tree.values.length;
    let add;
    if (dataInDb) {
      if (leave) continue;
    } else {
      add = true;
      dataInDb = new SteamFriend(
        [profile.address, index],
        friend.steamid,
        friend.relationship,
        friend.friend_since,
      );
    }
    try {
      if (leave) {
      } else {
        await tree.add(dataInDb.toJSON() as any);
      }
      if (add) orm.em.persist(dataInDb);
    } catch (e) {
      console.error(e);
    }
    await waiting(1000)
  }
  return orm.em.flush();
}
export async function fetchCollectible(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
  game: SteamOwnedGames,
) {
  //@ts-ignore
  const { primary_wallet } = Wallets.parse(profile.wallets);
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(undefined, primary_wallet);
  const tree = profileObj.entity<ISteamGameCollectible>("SteamOwnedCollectible");
  tree.setLeaves(
    await orm.em
      .find(
        SteamOwnedCollectible,
        {
          profile: {
            address: profile.address,
          },
        },
        {
          orderBy: {
            index: 1,
          },
        }
      )
      .then((rows) => rows.map((row) => row.toJSON() as SteamOwnedCollectible))
  );

  const steamId = profileObj.get("steamId");

  if (!steamId) return;

  console.log("launching puppeteer")

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://steamcommunity.com/inventory/${testingUser || profile.steamId}/${game.app_id || 730}/2?l=english&key=${config.steam_api_key || ""}`
  // Navigate to the Steam Community page you want to scrape
  await page.goto(url, { waitUntil: 'networkidle2' });


  await page.content();

  let innerText = await page.evaluate(() => {
    console.log("iner", document.querySelector("body"))
    return JSON.parse(document.querySelector("body")!.innerText);
  });

  console.log(innerText, url);
  if (!innerText?.assets) return;

  await browser.close();

  // const collectibleList = await honeycomb.http().get(url).then(res => (res.data.assets || []) as {
  //   "appid": number,
  //   "contextid": string,
  //   "assetid": string,
  //   "classid": string,
  //   "instanceid": string,
  //   "amount": string
  // }[]).catch(e => {
  //   console.log({ e })
  //   if (game.app_id == 730) console.log("err", e.response.statusText)
  //   return [];
  // })
  // console.log({ collectibleList }, url, game.app_id)
  for (let collect of innerText.assets as {
    "appid": number,
    "contextid": string,
    "assetid": string,
    "classid": string,
    "instanceid": string,
    "amount": string
  }[]) {
    let dataInDb = await orm.em.findOne(SteamOwnedCollectible, {
      profile,
      app_id: collect.appid,
    });
    const leave = tree.values.find((t) => t.app_id == collect.appid);
    let index = tree.values.length;
    let add;
    if (dataInDb) {
      if (leave) continue;
    } else {
      add = true;
      dataInDb = new SteamOwnedCollectible(
        [profile.address, index],
        collect.appid,
        collect.assetid,
        collect.classid,
        collect.amount,
      );
    }
    try {
      if (leave) {
      } else {
        await tree.add(dataInDb.toJSON() as any);
      }
      if (add) orm.em.persist(dataInDb);
    } catch (e) {
      console.error(e);
    }
  }
  await waiting(1000)


  return orm.em.flush();
}

export async function fetchGamePlayerStats(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
  game: SteamOwnedGames,
) {
  //@ts-ignore
  const { primary_wallet } = Wallets.parse(profile.wallets);
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(undefined, primary_wallet);
  const stats = profileObj.entity<ISteamGamePlayerStat>("SteamGamePlayerStat");
  stats.setLeaves(
    await orm.em
      .find(
        SteamGamePlayerStat,
        {
          profile: {
            address: profile.address,
          },
          app_id: game.app_id,
        },
        {
          orderBy: {
            index: 1,
          },
        }
      )
      .then((stats) => stats.map((t) => t.toJSON()))
  );

  const steamId = profileObj.get("steamId");
  if (!steamId) return;


  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${game.app_id}&key=${config.steam_api_key}&steamid=${profile.steamId}`
  const gamePlayerStat = await honeycomb.http().get(url).then(res => (res?.playerstats) as ISteamGamePlayerStatApi).catch(e => {
    console.error({ e })
    return;
  })
  if (!gamePlayerStat) return;

  for (let statRaw of gamePlayerStat.stats) {
    const dbStat = await orm.em.findOne(SteamGamePlayerStat, {
      profile: { address: profile.address },
      name: statRaw.name,
      app_id: game.app_id
    });
    const storedStat = stats.values.find((t) => t.name == statRaw.name && t.app_id == game.app_id);
    let index = stats.values.length;

    try {
      if (storedStat) {
        index = storedStat.index;
        if (storedStat.value != statRaw.value) {
          await stats.set(index, {
            index,
            name: statRaw.name,
            value: statRaw.value,
            app_id: game.app_id
          });
        }
      } else {
        await stats.add({
          index,
          name: statRaw.name,
          value: statRaw.value,
          app_id: game.app_id
        });
      }

      if (dbStat) {
        dbStat.value = statRaw.value;
      } else {
        const newStat = new SteamGamePlayerStat(
          [profile.address, index],
          statRaw.name,
          statRaw.value,
          game.app_id
        );
        orm.em.persist(newStat);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return orm.em.flush();
}
export async function fetchGameAchievements(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
  game: SteamOwnedGames,
) {
  //@ts-ignore
  const { primary_wallet } = Wallets.parse(profile.wallets);
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(undefined, primary_wallet);
  const achievements = profileObj.entity<ISteamAcheivements>("SteamGamePlayerStat");
  achievements.setLeaves(
    await orm.em
      .find(
        SteamAcheivements,
        {
          profile: {
            address: profile.address,
          },
          app_id: game.app_id,
        },
        {
          orderBy: {
            index: 1,
          },
        }
      )
      .then((achievements) => achievements.map((t) => t.toJSON()))
  );

  const steamId = profileObj.get("steamId");
  if (!steamId) return;


  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${game.app_id}&key=${config.steam_api_key}&steamid=${profile.steamId}`
  const gamePlayerStat = await honeycomb.http().get(url).then(res => (res?.playerstats) as ISteamGamePlayerStatApi).catch(e => {
    console.error({ e })
    return;
  })
  if (!gamePlayerStat) return;

  for (let achievementRow of gamePlayerStat.achievements) {
    const dbStat = await orm.em.findOne(SteamAcheivements, {
      profile: { address: profile.address },
      name: achievementRow.name,
      app_id: game.app_id
    });
    const storedAchievement = achievements.values.find((t) => t.name == achievementRow.name && t.app_id == game.app_id);
    let index = achievements.values.length;

    try {
      if (storedAchievement) {
        index = storedAchievement.index;
        if (storedAchievement.achieved != achievementRow.achieved) {
          await achievements.set(index, {
            index,
            name: achievementRow.name,
            achieved: achievementRow.achieved,
            app_id: game.app_id
          });
        }
      } else {
        await achievements.add({
          index,
          name: achievementRow.name,
          achieved: achievementRow.achieved,
          app_id: game.app_id
        });
      }

      if (dbStat) {
        dbStat.achieved = achievementRow.achieved;
      } else {
        const newAchievement = new SteamAcheivements(
          [profile.address, index],
          achievementRow.name,
          achievementRow.achieved,
          game.app_id
        );
        orm.em.persist(newAchievement);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return orm.em.flush();
}

export async function fetchOwnedGamesDetails(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
) {
  //@ts-ignore
  const { primary_wallet } = Wallets.parse(profile.wallets);
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(undefined, primary_wallet);
  const tree = profileObj.entity<ISteamOwnedGames>("SteamOwnedGames");
  tree.setLeaves(
    await orm.em
      .find(
        SteamOwnedGames,
        {
          profile: {
            address: profile.address,
          },
        },
        {
          orderBy: {
            index: 1,
          },
        }
      )
      .then((rows) => rows.map((row) => row.toJSON() as ISteamOwnedGames))
  );

  const steamId = profileObj.get("steamId");

  if (!steamId) return;
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam_api_key}&steamid=${testingUser || profile.steamId}&format=json&include_appinfo=1&include_played_free_games=1`
  const ownedGameList = await axios.get(url).then(res => (res.data.response?.games || []) as ISteamOwnedGamesApi[])
  console.log("ownedGameList")
  for (let ownGame of ownedGameList) {
    await orm.em.upsert(SteamGame, {
      app_id:
        ownGame.appid,
      gameImage: ownGame.img_icon_url,
      gameName: ownGame.name,
    });
    let dataInDb = await orm.em.findOne(SteamOwnedGames, {
      profile,
      app_id: ownGame.appid,
    });
    const leave = tree.values.find((t) => t.app_id == ownGame.appid);
    let index = tree.values.length;
    let add;

    if (dataInDb) {
      if (leave) continue;
    } else {
      add = true;
      dataInDb = new SteamOwnedGames(
        [profile.address, index],
        ownGame.appid,
        ownGame.playtime_forever,
        ownGame.rtime_last_played,
        ownGame.playtime_windows_forever,
        ownGame.playtime_mac_forever,
        ownGame.playtime_linux_forever,
      );
    }
    try {
      if (leave) {
        index = leave.index;
      } else {
        await tree.add(dataInDb.toJSON() as any);
      }
      if (add) {
        orm.em.persist(dataInDb);

      };
    } catch (e) {
      console.error(e);
    }
  }
  await waiting(2000)

  return orm.em.flush();
}

export async function ensureSteamUsersInDb(
  orm: MikroORM,
) {
  const idsSet = new Set<string>();
  (await orm.em.find(SteamFriend, {
  }, {
    fields: ["steamId"]
  })).forEach(v => {
    if (v.steamId)
      idsSet.add(v.steamId);
  });
  (await orm.em.find(Profile, {
  }, {
    fields: ["steamId"]
  })).forEach(v => {

    if (v.steamId)
      idsSet.add(v.steamId);
  });
  (await orm.em.find(SteamUser, {
    steamId: {
      $in: Array.from(idsSet)
    },
  }, {
    fields: ["steamId"]
  })).forEach(v => {

    idsSet.delete(v.steamId);
  });
  let ids = Array.from(idsSet);

  if (!ids.length) return;
  for (let index = 0; index < ids.length / 100; index++) {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steam_api_key}&steamids=${ids.slice(index * 100, (index + 1) * 100).join(',')}`
    const userSteamSummaries = await axios.get(url).then(res => ((res.data.response?.players) as {
      steamid: string;
      avatar: string;
      personaname: string;
      realname: string;
      level: number;
      loccountrycode: string;
    }[]));
    for (let summary of userSteamSummaries) {
      const steamUser = new SteamUser(summary.steamid || "", summary.avatar || "", summary.realname || summary.personaname || "", summary.loccountrycode || "", summary.level,)
      orm.em.persist(steamUser);
    }
    waiting(500);
  }
  return orm.em.flush();
}
// export async function ensureSteamGamePlayerStatsInDb(
//   orm: MikroORM,
// ) {
//   const idsSet = new Map<number, string>();
//   (await orm.em.find(SteamOwnedGames, {
//   }, {
//     fields: ["app_id", "profile"]
//   })).forEach(v => {
//     if (v.app_id && v.profile)
//       idsSet.set(v.app_id, v.profile.steamId)
//   });
//   // (await orm.em.find(Profile, {
//   // }, {
//   //   fields: ["steamId"]
//   // })).forEach(v => {

//   //   if (v.steamId)
//   //     idsSet.add(v.steamId);
//   // });

//   const or: any[] = [];

//   idsSet.forEach((v, k) => {
//     or.push({
//       steamGame: {
//         app_id: k,

//       },
//       profile: {
//         steamId: v
//       }
//     })
//   });

//   (await orm.em.find(SteamGamePlayerStat, {
//     $or: or,
//   }, {
//     fields: ["steamGame"]
//   })).forEach(v => {
//     idsSet.delete(v.steamGame.app_id);
//   });
//   // let ids = Array.from(idsSet);

//   if (!idsSet.size) return;
//   for (let [app_id, steamId] of idsSet) {
//     const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${app_id}&key=${config.steam_api_key}&steamid=${steamId}`
//     console.log(url)
//     const profile = await orm.em.find(Profile, {
//       steamId
//     });
//     const steamGamePlayerStat = await axios.get(url).then(res => ((res.data?.playerstats || {}) as ISteamGamePlayerStat));
//     console.log(steamGamePlayerStat)
//     for (let stat of steamGamePlayerStat.stats) {
//       const steamStat = new SteamGamePlayerStat(profile, stat.name, stat.value)
//       orm.em.persist(steamUser);
//     }
//     waiting(500);
//   }
//   return orm.em.flush();
// }
export async function ensureSteamGameCollectiblesAssetsInDb(
  orm: MikroORM,
) {
  const appClassIdsMap = new Map<number, Set<string>>();
  const addClassToApp = (app_id: number, classId: string) => {
    if (!appClassIdsMap.has(app_id)) {
      appClassIdsMap.set(app_id, new Set<string>());
    }
    appClassIdsMap.get(app_id)!.add(classId);
  }
  const removeClassFromAllApp = (classId: string) => {
    appClassIdsMap.forEach((v, k) => {
      v.delete(classId);
    })
  }
  const getAllClassIds = () => {
    return Array.from(appClassIdsMap.values()).reduce((a, b) => {
      b.forEach(v => a.add(v));
      return a;
    }, new Set<string>());
  }
  // let idsSet = new Set<{ classId: string, app_id: number }>();
  // const idsAppSet = new Set<number>();
  (await orm.em.find(SteamOwnedCollectible, {
  }, {
    fields: ["class_id", "app_id"]
  })).forEach(v => {

    if (v.class_id && v.app_id)
      addClassToApp(v.app_id, v.class_id)
  });
  (await orm.em.find(SteamAssetClassInfo, {
    class_id: {
      $in:
        Array.from(getAllClassIds().values()),
    },
  }, {
    fields: ["class_id"]
  })).forEach(v => {
    removeClassFromAllApp(v.class_id);
  });
  if (!appClassIdsMap.size) return;
  for (let [app_id, classIds] of appClassIdsMap) {
    const url = `https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/?key=${config.steam_api_key}&appid=${app_id}&class_count=${classIds.size}&${Array.from(classIds.values()).map((v, i) => `classid${i}=${v}`).join('&')}&language=en`
    const gameCollectibleAssets = await axios.get(url).then(res => ((res.data.result) as IAssetClassInfoApi)).catch(e => ({ success: false }));
    for (let [resKey, asset] of Object.entries(gameCollectibleAssets)) {
      if (!asset.classid || (["success", "error", "message"]).includes(resKey)) continue;
      const steamUser = new SteamAssetClassInfo(
        asset.classid,
        app_id,
        asset.icon_url,
        asset.name,
        asset.type
      )
      orm.em.persist(steamUser);
    }
    waiting(500);
  }
  return orm.em.flush();
}


export async function fetchAllEntitiesFor(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile
) {
  // All Entities for this profile will be fetched here
  // await fetchFriendList(honeycomb, orm, profile);
  await fetchOwnedGamesDetails(honeycomb, orm, profile);
}

export async function fetchAllEntitiesForGame(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
  game: SteamOwnedGames) {
  // All Entities for this game will be fetched here
  // await fetchCollectible(honeycomb, orm, profile, game);
  await fetchGamePlayerStats(honeycomb, orm, profile, game);
  await fetchGameAchievements(honeycomb, orm, profile, game);
}
const fetchCollectiblesForOnly = [730];
export async function fetchAllEntitiesForAllGame(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile,
) {
  const games = await orm.em.find(SteamOwnedGames, {
    profile: {
      address: profile.address,
    },
    app_id: {
      $in: fetchCollectiblesForOnly,
    }
  });
  for (let game of games) {
    await fetchAllEntitiesForGame(honeycomb, orm, profile, game);
  }
}

export async function fetchAllEntitiesForAllUser(
  honeycomb: Honeycomb,
  orm: MikroORM
) {
  const profiles = await orm.em.find(Profile, {});

  for (let profile of profiles) {
    await fetchAllEntitiesFor(honeycomb, orm, profile);
    await fetchAllEntitiesForAllGame(honeycomb, orm, profile);
  }
}

export async function refreshData(
  honeycomb: Honeycomb,
  orm: MikroORM
) {
  await fetchProfiles(honeycomb, orm);
  await fetchAllEntitiesForAllUser(honeycomb, orm);
  await ensureSteamUsersInDb(orm);
  await ensureSteamGameCollectiblesAssetsInDb(orm);
}

export function startSocket(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Started sockets...");
  return honeycomb.processedConnection.onProgramAccountChange(
    HIVECONTROL_PROGRAM_ID,
    async (account) => {
      const discriminator = Array.from(account.accountInfo.data.slice(0, 8));

      try {
        if (profileDiscriminator.join("") !== discriminator.join("")) {
          throw new Error("Profile Discriminator Mismatch");
        }

        const profileChain = ProfileChain.fromAccountInfo(
          account.accountInfo
        )[0];
        if (profileChain.project.equals(honeycomb.project().projectAddress)) {
          console.log(`Profile ${account.accountId.toString()} data changed`);
          await saveProfile(honeycomb, orm, account.accountId, profileChain);
        }
      } catch {
        try {
          if (userDiscriminator.join("") !== discriminator.join("")) {
            throw new Error("Profile Discriminator Mismatch");
          }

          const userChain = UserChain.fromAccountInfo(account.accountInfo)[0];
          console.log(`User ${account.accountId.toString()} data changed`);

          const profile = await orm.em.findOne(Profile, {
            useraddress: account.accountId,
          });

          if (!!profile) {
            //@ts-ignore
            profile.wallets = Wallets.from({
              primary_wallet: userChain.primaryWallet,
              secondary_wallets: userChain.secondaryWallets,
            }).toString();

            await orm.em.flush();
          }
        } catch {
          console.log(`${account.accountId} not matched any discriminator`);
        }
      }
    }
  );
}

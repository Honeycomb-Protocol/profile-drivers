import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  User as UserChain,
  Profile as ProfileChain,
  userDiscriminator,
  profileDiscriminator,
} from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { Profile, Wallets } from "../models";

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

export async function fetchFriendList(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile
) {
  //@ts-ignore
  // const { primary_wallet } = Wallets.parse(profile.wallets);
  // const profileObj = await honeycomb
  //   .identity()
  //   .fetch()
  //   .profile(undefined, primary_wallet);
  // const tweets = profileObj.entity<ITweet>("tweets");
  // tweets.setLeaves(
  //   await orm.em
  //     .find(
  //       Tweets,
  //       {
  //         profile: {
  //           address: profile.address,
  //         },
  //       },
  //       {
  //         orderBy: {
  //           index: 1,
  //         },
  //       }
  //     )
  //     .then((tweets) => tweets.map((t) => t.toJSON()))
  // );

  // const steamId = profileObj.get("steamId");

  // if (!steamId) return;

  // const tweetsRaw = await steam.get(`users/${steamId}/tweets`);

  // for (let tweetRaw of tweetsRaw.data) {
  //   const dbTweet = await orm.em.findOne(Tweets, {
  //     tweetId: tweetRaw.id,
  //   });
  //   const storedTweet = tweets.values.find((t) => t.tweetId == tweetRaw.id);
  //   let index = tweets.values.length;

  //   try {
  //     if (storedTweet) {
  //       index = storedTweet.index;
  //       // await tweets.set(index, {
  //       //   index,
  //       //   tweetId: tweetRaw.id,
  //       //   text: tweetRaw.text,
  //       // });
  //     } else {
  //       await tweets.add({
  //         index,
  //         tweetId: tweetRaw.id,
  //         text: tweetRaw.text,
  //       });
  //     }

  //     if (dbTweet) {
  //       dbTweet.text = tweetRaw.text;
  //     } else {
  //       const newTweet = new Tweets(
  //         [profile.address, index],
  //         tweetRaw.id,
  //         tweetRaw.text
  //       );
  //       orm.em.persist(newTweet);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // return orm.em.flush();
}

export async function fetchAllEntitiesFor(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile
) {
  // All Entities for this profile will be fetched here
  await fetchFriendList(honeycomb, orm, profile);
}

export async function fetchAllEntitiesForAllUser(
  honeycomb: Honeycomb,
  orm: MikroORM
) {
  const profiles = await orm.em.find(Profile, {});

  for (let profile of profiles) {
    await fetchAllEntitiesFor(honeycomb, orm, profile);
  }
}

export async function refreshData(
  honeycomb: Honeycomb,
  orm: MikroORM
) {
  await fetchProfiles(honeycomb, orm);
  await fetchAllEntitiesForAllUser(honeycomb, orm);
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

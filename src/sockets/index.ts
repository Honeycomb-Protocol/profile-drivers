import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  User as UserChain,
  Profile as ProfileChain,
  userDiscriminator,
  profileDiscriminator,
  identityToString,
} from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { Profile, Wallets } from "../models";
import Twitter from "twitter-lite";

export async function saveProfile(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profileAddress: web3.PublicKey,
  profileChain: ProfileChain
) {
  let profile = await orm.em.findOne(Profile, {
    address: profileAddress,
  });

  const userChain = await UserChain.fromAccountAddress(
    honeycomb.processedConnection,
    profileChain.user
  );

  if (!profile) {
    profile = new Profile(profileAddress);
    profile.useraddress = profileChain.user;
    profile.identity = identityToString(profileChain.identity);
    //@ts-ignore
    profile.wallets = Wallets.from({
      primary_wallet: userChain.primaryWallet,
      secondary_wallets: userChain.secondaryWallets,
    }).toString();

    const twitterId = profileChain.data.get("twitterId");
    if (twitterId && twitterId.__kind == "SingleValue") {
      profile.twitterId = twitterId.value;
    }

    const twitterUsername = profileChain.data.get("twitterUsername");
    if (twitterUsername && twitterUsername.__kind == "SingleValue") {
      profile.twitterUsername = twitterUsername.value;
    }

    orm.em.persist(profile);
    await orm.em.flush();
  } else {
    profile.useraddress = profileChain.user;
    profile.identity = identityToString(profileChain.identity);
    //@ts-ignore
    profile.wallets = Wallets.from({
      primary_wallet: userChain.primaryWallet,
      secondary_wallets: userChain.secondaryWallets,
    }).toString();

    const twitterId = profileChain.data.get("twitterId");
    if (twitterId && twitterId.__kind == "SingleValue") {
      profile.twitterId = twitterId.value;
    }

    const twitterUsername = profileChain.data.get("twitterUsername");
    if (twitterUsername && twitterUsername.__kind == "SingleValue") {
      profile.twitterUsername = twitterUsername.value;
    }

    await orm.em.flush();
  }

  return profile;
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

export async function fetchAndSaveSingleProfileByUserAddress(
  honeycomb: Honeycomb,
  userAddress: web3.PublicKey,
  orm: MikroORM
) {
  console.log("Refreshing Profiles...");
  const [profileChain] = await ProfileChain.gpaBuilder()
    .addFilter("project", honeycomb.project().address)
    .addFilter("user", userAddress)
    .run(honeycomb.connection);
  if (!profileChain) return null;
  return await saveProfile(
    honeycomb,
    orm,
    profileChain.pubkey,
    ProfileChain.fromAccountInfo(profileChain.account)[0]
  );
}

export async function fetchAllEntitiesFor(
  honeycomb: Honeycomb,
  orm: MikroORM,
  twitter: Twitter,
  profile: Profile
) {
  // All Entities for this profile will be fetched here
  // await fetchTweets(honeycomb, orm, twitter, profile);
}

export async function fetchAllEntitiesForAllUser(
  honeycomb: Honeycomb,
  orm: MikroORM,
  twitter: Twitter
) {
  const profiles = await orm.em.find(Profile, {});

  for (let profile of profiles) {
    fetchAllEntitiesFor(honeycomb, orm, twitter, profile);
  }
}

export async function refreshData(
  honeycomb: Honeycomb,
  orm: MikroORM,
  twitter: Twitter
) {
  await fetchProfiles(honeycomb, orm);
  await fetchAllEntitiesForAllUser(honeycomb, orm, twitter);
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

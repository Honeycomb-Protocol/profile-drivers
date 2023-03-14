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

export const saveProfile = async (
  honeycomb: Honeycomb,
  orm: MikroORM,
  profileAddress: web3.PublicKey,
  profileChain: ProfileChain
) => {
  const count = await orm.em.count(Profile, {
    address: profileAddress,
  });

  if (!count) {
    const userChain = await UserChain.fromAccountAddress(
      honeycomb.connection,
      profileChain.user
    );

    const profile = new Profile(profileAddress);
    profile.useraddress = profileChain.user;
    //@ts-ignore
    profile.wallets = Wallets.from({
      primary_wallet: userChain.primaryWallet,
      secondary_wallets: userChain.secondaryWallets,
    }).toString();
    orm.em.persist(profile);
    await orm.em.flush();
  }
};

export const refreshData = (honeycomb: Honeycomb, orm: MikroORM) => {
  console.log("Refreshing Profiles...");
  return ProfileChain.gpaBuilder()
    .addFilter("project", honeycomb.project().address)
    .run(honeycomb.connection)
    .then((profilesChain) =>
      Promise.all(
        profilesChain.map(async (profileChain) => {
          try {
            await saveProfile(
              honeycomb,
              orm,
              profileChain.pubkey,
              ProfileChain.fromAccountInfo(profileChain.account)[0]
            );
          } catch {}
        })
      )
    );
};

export const startSocket = (honeycomb: Honeycomb, orm: MikroORM) => {
  console.log("Started sockets...");
  return honeycomb.connection.onProgramAccountChange(
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
        console.log(`Profile ${account.accountId.toString()} data changed`);

        await saveProfile(honeycomb, orm, account.accountId, profileChain);
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
};

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

export const upsertUser = (orm: MikroORM, userChain: UserChain) => {};

export const refresh = (honeycomb: Honeycomb, orm: MikroORM) => {};

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
        console.log(`Found new profile ${account.accountId.toString()}`);

        const count = await orm.em.count(Profile, {
          address: account.accountId,
        });

        if (!count) {
          const userChain = await UserChain.fromAccountAddress(
            honeycomb.connection,
            profileChain.user
          );
          const profile = new Profile(account.accountId);
          profile.user_address = profileChain.user;
          //@ts-ignore
          profile.wallets = Wallets.from({
            primary_wallet: userChain.primaryWallet,
            secondary_wallets: userChain.secondaryWallets,
          }).toString();
          orm.em.persist(profile);
          orm.em.flush();
        }
      } catch {
        try {
          if (userDiscriminator.join("") !== discriminator.join("")) {
            throw new Error("Profile Discriminator Mismatch");
          }

          const userChain = UserChain.fromAccountInfo(account.accountInfo)[0];

          const profile = await orm.em.findOne(Profile, {
            user_address: account.accountId,
          });

          if (!!profile) {
            //@ts-ignore
            profile.wallets = Wallets.from({
              primary_wallet: userChain.primaryWallet,
              secondary_wallets: userChain.secondaryWallets,
            }).toString();

            orm.em.flush();
          }
        } catch {
          console.log(`${account.accountId} not matched any discriminator`);
        }
      }
    }
  );
};

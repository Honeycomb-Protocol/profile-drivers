import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  IdentityProfile,
  Profile as ProfileChain,
  getProfilePda,
  profileDiscriminator,
} from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { Profile } from "../models";
import { getMissionsProgram } from "../config";

const userLevelCalc = (xp: number) => {
  let level = {
    level: 0,
    next: 0,
  };

  for (let i = 0; i <= 101; i++) {
    let check = 25 * (i + i * i);
    if (xp < check) {
      level = { level: i - 1, next: check };
      break;
    }

    if (check >= 252500) {
      level = { level: i, next: check };
      break;
    }
  }
  return level;
};

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
    profile = new Profile({
      address: profileAddress,
      userAddress: profileChain.user,
      identity: profileChain.identity,
      xp: 0,
      level: 0,
      bounty: 0,
      resource1: 0,
      resource2: 0,
      resource3: 0,
    });
    orm.em.persist(profile);
  }

  // if (
  //   profileChain.data.get("xp") === undefined ||
  //   profileChain.data.get("level") === undefined ||
  //   profileChain.data.get("bounty") === undefined ||
  //   profileChain.data.get("resource1") === undefined ||
  //   profileChain.data.get("resource2") === undefined ||
  //   profileChain.data.get("resource3") === undefined
  // ) {
  //   const identityProfile = honeycomb.identity().register(profileChain);

  //   const user = await honeycomb.identity().fetch().user(identityProfile.user);

  //   let wallet: web3.PublicKey | undefined;
  //   if (
  //     user.primaryWallet
  //       .toString()
  //       .startsWith(identityProfile.profile().identity)
  //   ) {
  //     wallet = user.primaryWallet;
  //   } else {
  //     wallet = user.secondaryWallets.find((w) =>
  //       w.toString().startsWith(identityProfile.profile().identity)
  //     );
  //   }

  //   if (wallet) {
  //     const { missionsKey, missionsProgram } = await getMissionsProgram(
  //       honeycomb
  //     );

  //     const [userAddress] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("user"), wallet.toBuffer(), missionsKey.toBuffer()],
  //       missionsProgram.programId
  //     );

  //     const userAccount = await missionsProgram.account.userAccount.fetch(
  //       userAddress
  //     );

  //     if (!profileChain.data.get("xp")) {
  //       await identityProfile.add("xp", userAccount.xp.toString()).catch();
  //     }

  //     if (!profileChain.data.get("level")) {
  //       await identityProfile
  //         .add(
  //           "level",
  //           userLevelCalc(userAccount.xp.toNumber()).level.toString()
  //         )
  //         .catch();
  //     }

  //     if (!profileChain.data.get("bounty")) {
  //       await identityProfile
  //         .add("bounty", userAccount.bounty.toString())
  //         .catch();
  //     }

  //     if (!profileChain.data.get("resource1")) {
  //       await identityProfile
  //         .add("resource1", userAccount.resource1.toString())
  //         .catch();
  //     }

  //     if (!profileChain.data.get("resource2")) {
  //       await identityProfile
  //         .add("resource2", userAccount.resource2.toString())
  //         .catch();
  //     }

  //     if (!profileChain.data.get("resource3")) {
  //       await identityProfile
  //         .add("resource3", userAccount.resource3.toString())
  //         .catch();
  //     }
  //   }
  // }

  profile.xp = parseInt(
    ((profileChain.data.get("xp") as any).value || "0") as string
  );
  profile.level = parseInt(
    ((profileChain.data.get("level") as any).value || "0") as string
  );
  profile.bounty = parseInt(
    ((profileChain.data.get("bounty") as any).value || "0") as string
  );
  profile.resource1 = parseInt(
    ((profileChain.data.get("resource1") as any).value || "0") as string
  );
  profile.resource2 = parseInt(
    ((profileChain.data.get("resource2") as any).value || "0") as string
  );
  profile.resource3 = parseInt(
    ((profileChain.data.get("resource3") as any).value || "0") as string
  );

  await orm.em.flush();
  return profile;
}

export function fetchProfiles(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Refreshing Profiles...");
  return ProfileChain.gpaBuilder()
    .addFilter("project", honeycomb.project().address)
    .run(honeycomb.connection)
    .then((profilesChain) => {
      console.log("P", profilesChain.length);
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

export async function setSolPatrolStats(
  solpatrolUser: any,
  profile: IdentityProfile
) {
  const xp = solpatrolUser.xp.toNumber() / 100;
  const data = {
    xp: xp,
    level: userLevelCalc(xp).level,
    bounty: solpatrolUser.bounty.toNumber() / 100,
    resource1: solpatrolUser.resource1.toNumber() / 100,
    resource2: solpatrolUser.resource2.toNumber() / 100,
    resource3: solpatrolUser.resource3.toNumber() / 100,
  };

  try {
    await Promise.all(
      Object.entries(data).map(async ([key, value]) =>
        profile.get(key) === undefined
          ? profile.add(key, value.toString())
          : profile.set(key, value.toString())
      )
    );
  } catch (e) {
    console.error(e);
  }
}

export async function fetchSolpatrolUsers(honeycomb: Honeycomb, orm: MikroORM) {
  const { missionsProgram } = getMissionsProgram(honeycomb);

  const userAccounts = await missionsProgram.account.userAccount
    .all()
    .then((x) => {
      console.log("SP", x.length);
      return x;
    });

  const publicInfo = await honeycomb.publicInfo();
  const authDriver = publicInfo.get("auth_driver_offchain");

  if (!authDriver) {
    console.error("Auth driver not set");
    return;
  }

  for (let u of userAccounts) {
    try {
      const { success, data: user } = await honeycomb
        .http()
        .get(`${authDriver}/user/${u.account.wallet.toString()}`);
      if (!success) continue;
      if (!user) continue;

      const profile = await orm.em.findOne(Profile, {
        userAddress: user.address,
      });
      if (!profile) continue;

      const identityProfile = await honeycomb
        .identity()
        .fetch()
        .profile(
          honeycomb.project().address,
          new web3.PublicKey(user.address),
          u.account.wallet.toString().slice(0, 5)
        );
      if (!identityProfile) continue;
      console.log("identityProfile", identityProfile.identity());
      await setSolPatrolStats(u.account, identityProfile);
    } catch {}
  }
}

export async function refreshData(honeycomb: Honeycomb, orm: MikroORM) {
  await fetchProfiles(honeycomb, orm);
  await fetchSolpatrolUsers(honeycomb, orm);
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
      } catch {}
    }
  );
}

export function startMissionsSocket(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Started missions sockets...");
  const { missionsCoder, missionsProgram } = getMissionsProgram(honeycomb);
  return missionsProgram.provider.connection.onProgramAccountChange(
    missionsProgram.programId,
    async (account) => {
      try {
        const userAccount = missionsCoder.decode(
          "userAccount",
          account.accountInfo.data
        );

        const { user } = await honeycomb
          .identity()
          .fetch()
          .walletResolver(userAccount.wallet);
        const profile = await honeycomb
          .identity()
          .fetch()
          .profile(undefined, user);

        setSolPatrolStats(userAccount, profile);
      } catch (e) {
        console.error(e);
      }
    },
    "processed",
    [
      {
        dataSize: missionsProgram.account.userAccount.size,
      },
      {
        memcmp: missionsCoder.memcmp("userAccount"),
      },
    ]
  );
}

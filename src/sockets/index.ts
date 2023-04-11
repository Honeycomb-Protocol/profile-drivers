import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  IdentityProfile,
  Profile as ProfileChain,
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

  profile.xp = parseInt(
    (profileChain.data.get("missions_xp") || "0") as string
  );
  profile.level = parseInt(
    (profileChain.data.get("missions_level") || "0") as string
  );
  profile.bounty = parseInt(
    (profileChain.data.get("missions_bounty") || "0") as string
  );
  profile.resource1 = parseInt(
    (profileChain.data.get("missions_resource1") || "0") as string
  );
  profile.resource2 = parseInt(
    (profileChain.data.get("missions_resource2") || "0") as string
  );
  profile.resource3 = parseInt(
    (profileChain.data.get("missions_resource3") || "0") as string
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
      console.log(profilesChain.length);
      return Promise.all(
        profilesChain.map(async (profileChain) => {
          try {
            await saveProfile(
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
        profile.set(key, value.toString())
      )
    );
  } catch (e) {
    console.error(e);
  }
}

export function fetchSolpatrolUsers(honeycomb: Honeycomb) {
  const { missionsProgram } = getMissionsProgram(honeycomb);

  return missionsProgram.account.userAccount
    .all()
    .then((x) => {
      console.log("SP", x.length);
      return x;
    })
    .then((x) =>
      Promise.all(
        x.map(async (u) => {
          try {
            const { user } = await honeycomb
              .identity()
              .fetch()
              .walletResolver(u.account.wallet);
            const profile = await honeycomb
              .identity()
              .fetch()
              .profile(
                undefined,
                user,
                u.account.wallet.toString().slice(0, 5)
              );

            setSolPatrolStats(u, profile);
          } catch {}
        })
      )
    );
}

export async function refreshData(honeycomb: Honeycomb, orm: MikroORM) {
  await fetchProfiles(honeycomb, orm);
  await fetchSolpatrolUsers(honeycomb);
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
          await saveProfile(orm, account.accountId, profileChain);
        }
      } catch {}
    }
  );
}

export function startMissionsSocket(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Started missions sockets...");
  const { missionsCoder, missionsProgram } = getMissionsProgram(honeycomb);
  return honeycomb.processedConnection.onProgramAccountChange(
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

import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  IdentityProfile,
  Profile as ProfileChain,
  identityToString,
  profileDiscriminator,
} from "@honeycomb-protocol/hive-control";
import { MikroORM } from "@mikro-orm/core";
import { IParticipation, Participations, Profile } from "../models";
import { getMissionsProgram } from "../config";

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
    const user = await honeycomb.identity().fetch().user(profileChain.user);
    let wallet: web3.PublicKey | undefined =
      profileChain.identity.__kind === "Wallet"
        ? profileChain.identity.key
        : undefined;
    if (!wallet) {
      console.log(
        "No wallet found for profile",
        profileAddress.toString(),
        profileChain.identity
      );
      return;
    }

    console.log(
      "New profile",
      profileAddress.toString(),
      profileChain.identity,
      wallet.toString()
    );

    profile = new Profile({
      address: profileAddress,
      userAddress: profileChain.user,
      wallet,
      identity: identityToString(profileChain.identity),
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

  profile.xp =
    parseInt(((profileChain.data.get("xp") as any)?.value || "0") as string) ||
    0;
  profile.level =
    parseInt(
      ((profileChain.data.get("level") as any)?.value || "0") as string
    ) || 0;
  profile.bounty =
    parseInt(
      ((profileChain.data.get("bounty") as any)?.value || "0") as string
    ) || 0;
  profile.resource1 =
    parseInt(
      ((profileChain.data.get("resource1") as any)?.value || "0") as string
    ) || 0;
  profile.resource2 =
    parseInt(
      ((profileChain.data.get("resource2") as any)?.value || "0") as string
    ) || 0;
  profile.resource3 =
    parseInt(
      ((profileChain.data.get("resource3") as any)?.value || "0") as string
    ) || 0;

  await orm.em.flush();
  return profile;
}

export async function saveSolPatrolStats(
  solpatrolUser: any,
  profile: IdentityProfile
) {
  const xp = solpatrolUser.xp.toNumber() / 100;

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

  const data = {
    xp,
    level: level.level,
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
    console.error("Error Saving solpatrol stats", e);
  }
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
            console.error(
              "Error saving profile",
              profileChain.pubkey.toString(),
              e
            );
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

      await saveSolPatrolStats(u.account, identityProfile);
    } catch {}
  }
}

export async function fetchParticipationsFor(
  honeycomb: Honeycomb,
  orm: MikroORM,
  profile: Profile
) {
  const profileObj = await honeycomb
    .identity()
    .fetch()
    .profile(
      undefined,
      new web3.PublicKey(profile.userAddress),
      new web3.PublicKey(profile.identity)
    );

  const participations = await profileObj.entity<IParticipation>(
    "Participations"
  );
  if (!participations) return;
  participations.setLeaves(
    await orm.em
      .find(
        Participations,
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
      .then((ps) =>
        ps.map(
          (p) =>
            ({
              index: p.index,
              address: new web3.PublicKey(p.address),
              projectKey: new web3.PublicKey(p.projectKey),
              wallet: new web3.PublicKey(p.wallet),
              mint: new web3.PublicKey(p.mint),
              missionKey: new web3.PublicKey(p.missionKey),
              startTime: p.startTime,
              endTime: p.endTime,
              bounty: p.bounty,
              xp: p.xp,
              resource1: p.resource1,
              resource2: p.resource2,
              resource3: p.resource3,
              token: p.token,
              calculatedRewards: p.calculatedRewards,
              collectedRewards: p.collectedRewards,
              isRecalled: p.isRecalled,
            } as IParticipation)
        )
      )
  );

  const { missionsKey, missionsProgram } = getMissionsProgram(honeycomb);
  const participationsRaw = await missionsProgram.account.participation.all([
    {
      memcmp: {
        offset: 8,
        bytes: missionsKey.toString(),
      },
    },
    {
      memcmp: {
        offset: 8 + 32,
        bytes: profile.wallet.toString(),
      },
    },
  ]);

  for (let participationRaw of participationsRaw) {
    const dbParticipation = await orm.em.findOne(Participations, {
      address: participationRaw.publicKey,
    });
    const storedParticipation = participations.values.find((p) =>
      p.address.equals(participationRaw.publicKey)
    );
    const participation = {
      index: storedParticipation?.index || participations.values.length,
      address: participationRaw.publicKey,
      projectKey: participationRaw.account.projectKey,
      wallet: participationRaw.account.wallet,
      mint: participationRaw.account.mint,
      missionKey: participationRaw.account.missionKey,
      startTime: new Date(participationRaw.account.startTime.toNumber() * 1000),
      endTime: new Date(participationRaw.account.endTime.toNumber() * 1000),
      bounty: participationRaw.account.bounty.toNumber(),
      xp: participationRaw.account.xp.toNumber(),
      resource1: participationRaw.account.resource1.toNumber(),
      resource2: participationRaw.account.resource2.toNumber(),
      resource3: participationRaw.account.resource3.toNumber(),
      token: participationRaw.account.token.toNumber(),
      calculatedRewards: participationRaw.account.calculatedRewards,
      collectedRewards: participationRaw.account.collectedRewards,
      isRecalled: participationRaw.account.isRecalled,
    };

    try {
      if (storedParticipation) {
      } else {
        await participations.add(participation);
      }

      if (dbParticipation) {
      } else {
        await orm.em.persistAndFlush(
          new Participations(profile.address, participation)
        );
      }
    } catch (e) {
      console.error(e, "Error while saving participation", participation);
    }
  }
}

export async function fetchAllEntitiesForAllUser(
  honeycomb: Honeycomb,
  orm: MikroORM
) {
  const profiles = await orm.em.find(Profile, {});

  for (let profile of profiles) {
    // All Entities for this profile will be fetched here
    await fetchParticipationsFor(honeycomb, orm, profile);
  }
}

export async function refreshData(honeycomb: Honeycomb, orm: MikroORM) {
  await fetchProfiles(honeycomb, orm);
  await fetchSolpatrolUsers(honeycomb, orm);
  await fetchAllEntitiesForAllUser(honeycomb, orm);
}

export function startProfilesSocket(honeycomb: Honeycomb, orm: MikroORM) {
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

export function startMissionsUserSocket(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Started mission users sockets...");
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

        saveSolPatrolStats(userAccount, profile);
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

export function startParticipationsSocket(honeycomb: Honeycomb, orm: MikroORM) {
  console.log("Started mission participation sockets...");
  const { missionsCoder, missionsProgram } = getMissionsProgram(honeycomb);
  return missionsProgram.provider.connection.onProgramAccountChange(
    missionsProgram.programId,
    async (account) => {
      try {
        const participationRaw = missionsCoder.decode(
          "participation",
          account.accountInfo.data
        );

        console.log("Participation changed", account.accountId);

        const profile = await orm.em.findOne(Profile, {
          wallet: participationRaw.wallet,
        });

        if (!profile) return;

        const profileObj = await honeycomb
          .identity()
          .fetch()
          .profile(
            undefined,
            new web3.PublicKey(profile.userAddress),
            new web3.PublicKey(profile.identity)
          );

        const participations = await profileObj.entity<IParticipation>(
          "Participations"
        );
        if (!participations) return;
        participations.setLeaves(
          await orm.em
            .find(
              Participations,
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
            .then((ps) =>
              ps.map(
                (p) =>
                  ({
                    index: p.index,
                    address: new web3.PublicKey(p.address),
                    projectKey: new web3.PublicKey(p.projectKey),
                    wallet: new web3.PublicKey(p.wallet),
                    mint: new web3.PublicKey(p.mint),
                    missionKey: new web3.PublicKey(p.missionKey),
                    startTime: p.startTime,
                    endTime: p.endTime,
                    bounty: p.bounty,
                    xp: p.xp,
                    resource1: p.resource1,
                    resource2: p.resource2,
                    resource3: p.resource3,
                    token: p.token,
                    calculatedRewards: p.calculatedRewards,
                    collectedRewards: p.collectedRewards,
                    isRecalled: p.isRecalled,
                  } as IParticipation)
              )
            )
        );

        const dbParticipation = await orm.em.findOne(Participations, {
          address: account.accountId,
        });
        const storedParticipation = participations.values.find((p) =>
          p.address.equals(account.accountId)
        );
        const participation = {
          index: storedParticipation?.index || participations.values.length,
          address: account.accountId,
          projectKey: participationRaw.projectKey,
          wallet: participationRaw.wallet,
          mint: participationRaw.mint,
          missionKey: participationRaw.missionKey,
          startTime: new Date(participationRaw.startTime.toNumber() * 1000),
          endTime: new Date(participationRaw.endTime.toNumber() * 1000),
          bounty: participationRaw.bounty.toNumber(),
          xp: participationRaw.xp.toNumber(),
          resource1: participationRaw.resource1.toNumber(),
          resource2: participationRaw.resource2.toNumber(),
          resource3: participationRaw.resource3.toNumber(),
          token: participationRaw.token.toNumber(),
          calculatedRewards: participationRaw.calculatedRewards,
          collectedRewards: participationRaw.collectedRewards,
          isRecalled: participationRaw.isRecalled,
        };

        try {
          if (storedParticipation) {
            await participations.set(participation.index, participation);
          } else {
            await participations.add(participation);
          }

          if (dbParticipation) {
            dbParticipation.calculatedRewards = participation.calculatedRewards;
            dbParticipation.collectedRewards = participation.collectedRewards;
            dbParticipation.isRecalled = participation.isRecalled;
          } else {
            await orm.em.persist(
              new Participations(profile.address, participation)
            );
          }
          await orm.em.flush();

          console.log("Participation saved", participation.address);
        } catch (e) {
          console.error(e, "Error while saving participation", participation);
        }
      } catch (e) {
        console.error(e);
      }
    },
    "processed",
    [
      {
        dataSize: missionsProgram.account.participation.size,
      },
      {
        memcmp: missionsCoder.memcmp("participation"),
      },
    ]
  );
}

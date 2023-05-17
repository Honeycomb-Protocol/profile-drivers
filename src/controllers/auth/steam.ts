import * as web3 from "@solana/web3.js";
import express, { Response } from "express";
import { Request } from "../../types";
import { ResponseHelper } from "../../utils";
import { Profile } from "../../models";
import { fetchAllEntitiesFor, fetchAndSaveSingleProfileByUserAddress, saveProfile } from "../../sockets";
import { authenticate } from "../../middlewares";
import { IdentityProfile, getProfilePda } from "@honeycomb-protocol/hive-control";
import config from "../../config";

const router = express.Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);
    console.log("req", req.user, req.steam)
    if (!req.user || !req.steam)
        return response.error("web3User not found in session.");
    try {
        const redirectUrl = await req.steam.getRedirectUrl();
        res.send(
            {
                steamUrl: redirectUrl,
            }
        );
    } catch (err: any) {
        console.error(err);
        response.error(err.message);
    }
});
router.get("/callback", authenticate, async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);
    if (!req.user || !req.orm || !req.honeycomb || !req.steam)
        return response.error("web3User not found in session.");

    try {
        const user = await req.steam.authenticate(req);
        const url = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${config.steam_api_key}&steamid=${user.steamid}`;
        const { player_level } = await req.honeycomb.http().get(url).then(res => {
            return (res.response || {}) as {
                "player_level": number
            }
        });
        const urlForPlayerSummary = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steam_api_key}&steamids=${user.steamid}`;
        const { players: [{ avatarfull }] } = await req.honeycomb.http().get(urlForPlayerSummary).then(res => {
            return (res.response || {}) as {
                players: { avatarfull: string }[]
            }
        });

        response.ok("Steam Auth Success!", {
            steamLevel: (player_level).toString(),
            steamId: user.steamid,
            steamUsername: user.username || user.name,
            steamImage: avatarfull,
        });
    } catch (err: any) {
        console.error(err);
        response.error(err.message, err);
    }
});

router.get("/profile/:identity", authenticate, async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);
    console.log('req.params')
    if (!req.user || !req.orm || !req.honeycomb || !req.steam)
        return response.error("web3User not found in session.");

    req.orm?.em
        .find(Profile, {
            $or: [
                {
                    userAddress: req.params.identity,
                },
            ]
        })
        .then(async (profiles) => {
            response.ok("Profile found!", {
                profiles
            });
        }).catch(e => {
            console.error("verifying identity", e);
            response.error("Verifying not found!");
        })
});

router.post("/createProfile", authenticate, async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);
    const {
        steamId,
        steamUsername,
        steamLevel,
        steamImage
    }
        :
        {
            steamId: string,
            steamUsername: string,
            steamLevel: string,
            steamImage: string
        } = req.body;

    if (!steamId || !steamUsername || !steamLevel) return res.status(400).send("Missing steamId, steamUsername, or steamLevel");

    if (!req.user || !req.orm || !req.honeycomb || !req.steam)
        return response.error("web3User not found in session.");

    try {

        let profile: Profile = await req.orm.em.findOne(Profile, {
            userAddress: req.user.address,
        }) as any;
        if (!profile) profile = await fetchAndSaveSingleProfileByUserAddress(req.honeycomb, new web3.PublicKey(req.user.address), req.orm) as Profile;

        let profileChain: IdentityProfile = await req.honeycomb
            .identity()
            .fetch()
            .profile(
                req.honeycomb.project().address,
                new web3.PublicKey(req.user.address),
                steamId
            );
        if (!profileChain) return response.notFound("Profile not found!");

        if (!profile) {
            const profileOrUndefined = await saveProfile(
                req.honeycomb,
                req.orm,
                getProfilePda(req.honeycomb.project().address, new web3.PublicKey(req.user.address))[0],
                profileChain.profile()
            );
            if (!profileOrUndefined) return response.error("Couldn't save profile");
            profile = profileOrUndefined;
        }


        if (!profile) return response.error("Profile not found!");
        if (profile.steamId && profile.steamUsername) {
            return response.conflict(
                "Steam credentials already set for this profile"
            );
        }
        await profileChain.add("steamId", steamId).then((_) => {
            profile.steamId = steamId;
        }).catch(console.error);

        await profileChain.add("steamLevel", steamLevel).then((_) => {
            profile.steamLevel = Number(steamLevel);
        }).catch(console.error);

        await profileChain.add("steamUsername", steamUsername).then((_) => {
            profile.steamUsername = steamUsername;
        }).catch(console.error);
        if (steamImage) {
            await profileChain.add("steamImage", steamImage).then((_) => {
                profile.steamImage = steamImage;
            }).catch(console.error);
        }
        req.orm.em.persist(profile);
        await req.orm.em.flush();
        await fetchAllEntitiesFor(req.honeycomb, req.orm, profile)
        response.ok("Profile created!", {
            profile,
        })

    } catch (err: any) {
        console.error(err);
        response.error(err.message, err);
    }
})



export default router;

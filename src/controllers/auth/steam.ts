import * as web3 from "@solana/web3.js";
import express, { Response } from "express";
import { Request } from "../../types";
import { ResponseHelper } from "../../utils";
import { Profile, Wallets } from "../../models";
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

    let profile: Profile = await req.orm.em.findOne(Profile, {
        useraddress: req.user.address,
    }) as any;
    if (!profile) profile = await fetchAndSaveSingleProfileByUserAddress(req.honeycomb, new web3.PublicKey(req.user.address), req.orm) as Profile;

    // let profileChain: IdentityProfile;
    // if (!profile) {
    //     profileChain = await req.honeycomb
    //       .identity()
    //       .fetch()
    //       .profile(
    //         req.honeycomb.project().address,
    //         new web3.PublicKey(req.user.address)
    //       );

    //     if (!profileChain) return response.notFound("Profile not found!");

    //     profile = await saveProfile(
    //       req.honeycomb,
    //       req.orm,
    //       getProfilePda(req.honeycomb.project().address, req.user.address)[0],
    //       profileChain.profile()
    //     );
    //   }

    if (!profile) return response.error("Profile not found!");
    // if (profile.steamId && profile.steamUsername) {
    //     return response.conflict(
    //         "Steam credentials already set for this profile"
    //     );
    // }
    try {
        const user = await req.steam.authenticate(req);
        const url = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${config.steam_api_key}&steamid=${user.steamid}`;
        const { player_level } = await req.honeycomb.http().get(url).then(res => {
            return (res.response || {}) as {
                "player_level": number
            }
        });
        const profileChain = await req.honeycomb
            .identity()
            .fetch()
            .profile(
                req.honeycomb.project().address,
                new web3.PublicKey(profile.useraddress),
                profile.identity
            );

        await profileChain.add("steamId", user.steamid).then((_) => {
            profile.steamId = user.steamid;
        }).catch(console.error);

        await profileChain.add("steamLevel", player_level.toString()).then((_) => {
            profile.steamLevel = player_level;
        }).catch(console.error);

        await profileChain.add("steamUsername", user.username || user.name).then((_) => {
            profile.steamUsername = user.username || user.name;
        }).catch(console.error);

        req.session.steamUser = user;
        await req.orm.em.flush();
        await fetchAllEntitiesFor(req.honeycomb, req.orm, profile)


        response.ok("Steam Auth Success!");
    } catch (err: any) {
        console.error(err);
        response.error(err.message, err);
    }
});

export default router;

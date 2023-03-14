import express, { Response } from "express";
import { Request } from "../../types";
import { ResponseHelper } from "../../utils";
import { Profile, Wallets } from "../../models";
import { fetchAllEntitiesFor } from "../../sockets";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);

    if (!req.session.web3User || !req.steam)
        return response.error("web3User not found in session.");
    try {
        const redirectUrl = await req.steam.getRedirectUrl();
        res.redirect(
            redirectUrl
        );
    } catch (err: any) {
        console.error(err);
        response.error(err.message);
    }
});
router.get("/callback", async (req: Request, res: Response) => {
    const response = new ResponseHelper(res);

    if (!req.session.web3User || !req.orm || !req.honeycomb || !req.steam)
        return response.error("web3User not found in session.");

    const profile = await req.orm.em.findOne(Profile, {
        address: req.session.web3User.address,
    });

    if (!profile) {
        return response.error("Profile not found!");
    }
    console.log(profile)
    // if (profile.steamId || profile.steamUsername) {
    //     return response.conflict(
    //         "Steam credentials already set for this profile"
    //     );
    // }
    try {
        const user = await req.steam.authenticate(req);

        //@ts-ignore
        const { primary_wallet } = Wallets.parse(profile.wallets);
        const profileChain = await req.honeycomb
            .identity()
            .fetch()
            .profile(req.honeycomb.project().address, primary_wallet);

        await profileChain.add("steamUsername", user.username || user.name).then((_) => {
            profile.steamUsername = user.username || user.name;
        }).catch();

        await profileChain.add("steamId", user.steamid).then((_) => {
            profile.steamId = user.steamid;
        }).catch();

        req.session.steamUser = user;
        await req.orm.em.flush();

        await fetchAllEntitiesFor(req.honeycomb, req.orm, profile)
        response.ok("Steam Auth Success!");
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

export default router;

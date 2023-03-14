import express, { Handler } from "express";
import { Profile, Wallets } from "../models";
import { Request } from "../types";
import { ResponseHelper } from "../utils";

const getProfile: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .findOne(Profile, {
      $or: [
        {
          address: req.params.identity,
        },
        {
          user_address: req.params.identity,
        },
        {
          wallets: {
            $like: `%${req.params.identity}%`,
          },
        },
      ],
    })
    .then((profile) => {
      if (!profile) return response.notFound();
      //@ts-ignore
      profile.wallets = Wallets.parse(profile.wallets);
      return response.ok(undefined, profile);
    })
    .catch((e) => response.error(e.message));
};

const getProfiles: Handler = (req: Request, res) => {
  const response = new ResponseHelper(res);

  return req.orm?.em
    .find(Profile, {})
    .then((profiles) =>
      response.ok(
        undefined,
        profiles.map((p) => {
          const profile = p.toJSON();
          // //@ts-ignore
          // profile.wallets = Wallets.parse(profile.wallets);
          return profile;
        })
      )
    )
    .catch((e) => response.error(e.message));
};

const router = express.Router();

router.get("/", getProfiles);
router.get("/:identity", getProfile);

export default router;

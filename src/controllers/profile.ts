import express, { Handler } from "express";
import { Profile } from "../models";
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
          userAddress: req.params.identity,
        },
      ],
    })
    .then((profile) => {
      if (!profile) return response.notFound();
      const profileNew = profile.toJSON();
      return response.ok(undefined, profileNew);
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

import express from "express";
import { ResponseHelper } from "../utils";
import { Request } from "../types";
import { EntityName } from "@mikro-orm/core";

export function buildEntityRoute(model: EntityName<any>) {
  const router = express.Router();

  router.get(`/:walletOrUser`, async (req: Request, res) => {
    const response = new ResponseHelper(res);
    if (!req.orm) return response.error("ORM not initialized");

    const data = await req.orm.em.find(model, {
      profile: {
        $or: [
          {
            address: req.params.walletOrUser,
          },
          {
            user_address: req.params.walletOrUser,
          },
          {
            wallets: {
              $like: `%${req.params.walletOrUser}%`,
            },
          },
        ],
      },
    });

    return response.ok(undefined, data);
  });

  router.get(`/:walletOrUser/:index`, async (req: Request, res) => {
    const response = new ResponseHelper(res);
    if (!req.orm) return response.error("ORM not initialized");

    const data = await req.orm.em.findOne(
      model,
      {
        index: parseInt(req.params.index),
        profile: {
          $or: [
            {
              address: req.params.walletOrUser,
            },
            {
              user_address: req.params.walletOrUser,
            },
            {
              wallets: {
                address: req.params.walletOrUser,
              },
            },
          ],
        },
      },
      {
        populate: ["profile"],
      }
    );
    return response.ok(undefined, data);
  });

  return router;
}

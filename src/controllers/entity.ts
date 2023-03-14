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
      user: {
        $or: [
          {
            address: req.params.walletOrUser,
          },
          {
            wallets: {
              address: req.params.walletOrUser,
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
        user: {
          $or: [
            {
              address: req.params.walletOrUser,
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
        populate: ["user"],
      }
    );
    return response.ok(undefined, data);
  });

  return router;
}

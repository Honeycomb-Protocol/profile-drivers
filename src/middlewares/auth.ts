import { Handler, Response, NextFunction } from "express";
import { Request } from "../types";
import { ResponseHelper } from "../utils";

export const authenticate: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = new ResponseHelper(res);
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    if (req.session.web3User) {
      req.user = req.session.web3User;
    } else {
      if (!req.honeycomb) return response.error("Honeycomb not initialized!");
      const publicInfo = await req.honeycomb.publicInfo();
      let authDriver = publicInfo.get("auth_driver_offchain");
      if (!authDriver) return response.notFound("Auth driver not found!");
      if (authDriver.charAt(-1) === "/") authDriver = authDriver.slice(0, -1);

      try {
        const {
          success,
          message,
          data: user,
        } = await req.honeycomb.http().get(`${authDriver}/auth/user`, {
          authToken: req.headers.authorization.split(" ")[1],
        });
        if (!success) return response.unauthorized(message);

        req.session.web3User = user;
        req.user = user;
      } catch (e: any) {
        return response.unauthorized(e.response.data.message);
      }
    }
  } else {
    return response.unauthorized("Token not provided!");
  }

  next();
};

export const bypass_authenticate: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = new ResponseHelper(res);

  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    if (req.session.web3User) {
      req.user = req.session.web3User;
    } else {
      if (!req.honeycomb) return response.error("Honeycomb not initialized!");
      const publicInfo = await req.honeycomb.publicInfo();
      let authDriver = publicInfo.get("auth_driver_offchain");
      if (!authDriver) return response.notFound("Auth driver not found!");
      if (authDriver.charAt(-1) === "/") authDriver = authDriver.slice(0, -1);

      try {
        const { success, data: user } = await req.honeycomb
          .http()
          .get(`${authDriver}/auth/user`, {
            authToken: req.headers.authorization.split(" ")[1],
          });
        if (success) {
          req.session.web3User = user;
          req.user = user;
        }
      } catch {}
    }
  }

  next();
};
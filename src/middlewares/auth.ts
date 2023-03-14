import { Handler, Response, NextFunction } from "express";
import { Request } from "../types";
import { ResponseHelper, verify_token } from "../utils";

const fetchUser = async (primary_wallet: string) => ({
  primary_wallet,
});

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
    const decoded = verify_token(req.headers.authorization.split(" ")[1]);
    if (!decoded) return response.unauthorized("Invalid Token");
    try {
      req.user = await fetchUser(decoded.primary_wallet);
      next();
    } catch {
      return response.unauthorized(
        "Could not find the user associated with token"
      );
    }
  } else {
    return response.unauthorized("Token not provided!");
  }
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
    const decoded = verify_token(req.headers.authorization.split(" ")[1]);
    if (decoded) {
      try {
        req.user = await fetchUser(decoded.primary_wallet);
      } catch (e) {}
    }
  }

  next();
};

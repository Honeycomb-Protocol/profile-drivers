import express from "express";
import { ResponseHelper } from "../utils";
import profile from "./profile";
import auth from "./auth";
import authTw from "./auth/twitter";
import authSteam from "./auth/steam";

const router = express.Router();

router.use("/profile", profile);
router.use("/auth", auth);
router.use("/twitter/auth", authTw);
router.use("/steam/auth", authSteam);
router.use((_, res) => new ResponseHelper(res).notFound("Path not found"));

export default router;

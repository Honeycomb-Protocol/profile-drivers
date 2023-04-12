import express from "express";
import { ResponseHelper } from "../utils";
import profile from "./profile";
import authSteam from "./auth/steam";
import steam from './steam'
const router = express.Router();

router.use("/profile", profile);
router.use("/steam/auth", authSteam);
router.use("/steam", steam);
router.use((_, res) => new ResponseHelper(res).notFound("Path not found"));

export default router;

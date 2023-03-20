import express from "express";
import { ResponseHelper } from "../utils";
import profile from "./profile";
import authTw from "./auth/twitter";

const router = express.Router();

router.use("/profile", profile);
router.use("/twitter/auth", authTw);
router.use((_, res) => new ResponseHelper(res).notFound("Path not found"));

export default router;

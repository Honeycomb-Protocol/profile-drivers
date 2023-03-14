import express from "express";
import { ResponseHelper } from "../utils";
import profile from "./profile";

const router = express.Router();

router.use("/profile", profile);
router.use((_, res) => new ResponseHelper(res).notFound("Path not found"));

export default router;

import express from "express";
import { ResponseHelper } from "../utils";
import profile from "./profile";
import solpatrol from "./solpatrol";

const router = express.Router();

router.use("/profile", profile);
router.use("/solpatrol", solpatrol);
router.use((_, res) => new ResponseHelper(res).notFound("Path not found"));

export default router;

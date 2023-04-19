import { Honeycomb } from '@honeycomb-protocol/hive-control';
import express, { Handler, Response } from "express";
import * as anchor from '@project-serum/anchor';
import { Participations } from "../models";
import { Request } from "../types";
import { ResponseHelper } from "../utils";
import { getMissionsProgram } from "../config";
import { PublicKey } from '@solana/web3.js';


const getProjects = async (honeycomb: Honeycomb) => {
    if (!honeycomb) return undefined;

    const { missionsProgram, missionProject } = getMissionsProgram(honeycomb);

    const [projectAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("project", "utf8"),
            missionProject.toBuffer(),
        ],
        missionsProgram.programId
    );

    // STORING PROJECT ADDRESS FOR FURTHER USE
    try {
        const _projectInfo = await missionsProgram.account.project.fetch(
            projectAddress
        );

        return _projectInfo;
    } catch (e) {
        console.error(e, "PROJECT INFO FETCH CRASHED");
        return undefined
    }
};

const getMissions = async (honeycomb: Honeycomb) => {
    if (!honeycomb) return undefined;

    const { missionsProgram, missionProject } = getMissionsProgram(honeycomb);
    const projectInfo = await getProjects(honeycomb);

    if (!projectInfo) return false;

    try {
        const missions =
            await missionsProgram.account.mission.all([
                {
                    memcmp: {
                        offset: 8,
                        bytes: missionProject.toString(),
                    },
                },
            ])


        return missions;
    } catch (e) {
        console.error(e, "FETCH MISSION CRASHED");
        return undefined;
    }

};

const getStats: Handler = async (req: Request, res) => {
    const response = new ResponseHelper(res);
    if (!req.honeycomb) return response.error("Honeycomb not found");

    try {
        const result = await req.orm?.em.createQueryBuilder(Participations, 'p')
            .select([
                'max(p.token) as highest_bail_earned',
                'sum(p.is_recalled) as total_mission_completed',
                'avg(p.token) as avg_rewards_per_mission',
                'sum(p.token) as total_bail_earned',
                'sum(p.bounty) as total_bounty_earned',
                'sum(p.resource1) as total_resource1_earned',
                'sum(p.resource2) as total_resource2_earned',
                'sum(p.resource3) as total_resource3_earned',
            ])
            .where(`p.profile_address LIKE '%${req.params.identity}%'`)
            .execute("get")

        const [mission] = await req.orm?.em.createQueryBuilder(Participations, 'p')
            .raw(`SELECT p.mission_key as favourite_mission_key, count(p.mission_key) as mission_count FROM participations as p WHERE p.profile_address LIKE '%${req.params.identity}%' GROUP BY p.mission_key ORDER BY mission_count DESC LIMIT 1`)
        if (mission) {
            const { missionsProgram } = getMissionsProgram(req.honeycomb)

            const [missionsAddress] = PublicKey.findProgramAddressSync([
                Buffer.from("mission"),
                new PublicKey(mission.favourite_mission_key).toBuffer(),
            ], missionsProgram.programId)
            const missionObj = await missionsProgram.account.mission.fetch(missionsAddress)
            return response.ok(undefined, {
                ...result,
                ...mission,
                favourite_mission_name: missionObj.name,
            })
        } else return response.ok(undefined, {
            ...result,
            ...mission,

        })

    } catch (e: any) {
        return response.error(e.message)
    }

    // let d = req.orm?.em.createQueryBuilder(Participations, 'p')
    //     .select(['max(p.token) as highest_bail_earned', 'sum(p.is_recalled) as total_mission_completed',
    //         'avg(p.token) as avg_rewards_per_mission', 'sum(p.token) as total_bail_earned',
    //         'sum(p.bounty) as total_bounty_earned', 'sum(p.resource1) as total_resource1_earned', 'sum(p.resource2) as total_resource2_earned',
    //         'sum(p.resource3) as total_resource3_earned',
    //     ])
    //     // .leftJoin('profile', 'p1', 'p1.address LIKE p.profile_address')
    //     // .where(`p1.address LIKE '%${req.params.identity}%'`)
    //     // .orWhere(`p1.user_address LIKE '%${req.params.identity}%'`)
    //     // .orWhere(`p1.identity LIKE '%${req.params.identity}%'`)

    //     .execute("get")
    //     .then((result) => {
    //         response.ok(
    //             undefined,
    //             result
    //         )
    //     }).catch(err => {
    //         response.error(err.message)
    //     })

};

const router = express.Router();

router.get("/:identity", getStats);

export default router;

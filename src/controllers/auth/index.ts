import { TransactionSignature } from "@honeycomb-protocol/hive-control";
import { PublicKey } from "@solana/web3.js";
import express, { Response } from "express";
import { Profile } from "../../models";

import { Request } from "../../types";
import { ResponseHelper } from "../../utils";

const router = express.Router();
const verify_signature = async (
  signature: TransactionSignature,
  wallet: PublicKey
) => {
  // @TODO: Verify Signature
  return true;
};
router.get("/web3/:signerWallet", async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);
  const { signerWallet } = req.params;

  console.log(req.session);
  if (!(signerWallet && req.orm)) {
    return response.error("Invalid data.");
  }
  const profile = await req.orm.em.findOne(Profile, {
    wallets: {
      $like: `%${signerWallet}%`,
    },
  });
  if (!profile) {
    return response.error("Profile not found!");
  }
  req.session.web3UserAuthReq = {
    profileAddress: profile.address,
    signerWallet,
  };

  response.ok("web3UserAuthReq created successfully!");
});

router.get("/web3/verify/:signature", async (req: Request, res: Response) => {
  const response = new ResponseHelper(res);
  const { signature } = req.params;
  if (!req.session?.web3UserAuthReq) {
    return response.error("Auth Request not found!");
  }
  const { profileAddress, signerWallet } = req.session.web3UserAuthReq;

  console.log(req.session);
  if (!(profileAddress && signerWallet && signature && req.orm)) {
    return response.error("Invalid data.");
  }
  const profile = await req.orm.em.findOne(Profile, {
    address: profileAddress,
    wallets: {
      $like: `%${signerWallet}%`,
    },
  });
  if (!profile) {
    return response.error("Profile not found!");
  }
  const verified = await verify_signature(signature, signerWallet);
  if (!verified) {
    delete req.session.web3UserAuthReq;
    return response.error("Verification failed, web3UserAuthReq closed;");
  }
  delete req.session.web3UserAuthReq;
  req.session.web3User = profile.toJSON();
  response.ok("Auth Success");
});

router.get("/user", (req: Request, res: Response) => {
  console.log(req.session);
  if (req.session.web3User) {
    res.send("You are logged in as " + req.session.web3User.address);
  } else {
    res.send("Please log in");
  }
});

export default router;

import {
  Entity,
  Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { ProvableEntity, IProvableEntity } from "../types/ProvableEntity";
export interface ISteamFriend extends IProvableEntity {
  steamId: string;
  relationship: string;
  friendSince: number;
}
@Entity()
export class SteamFriend extends ProvableEntity<SteamFriend> {

  @Property()
  steamId!: string;

  @Property()
  relationship!: string;

  @Property()
  friendSince!: number;

  constructor(
    [profile_address, index]: [PublicKey, number],
    steamId: string,
    relationship: string,
    friendSince: number,
  ) {
    super(profile_address, index);
    this.steamId = steamId;
    this.relationship = relationship;
    this.friendSince = friendSince;
  }
}

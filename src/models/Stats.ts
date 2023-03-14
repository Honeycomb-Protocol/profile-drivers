import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../types/BaseEntity";
import { PublicKey } from "@solana/web3.js";

@Entity()
export class Stats extends BaseEntity<Stats> {
  @Property()
  rank!: number;

  @Property()
  level!: number;

  constructor(
    [profile_address, index]: [PublicKey, number],
    rank: number,
    level: number
  ) {
    super(profile_address, index);
    this.rank = rank;
    this.level = level;
  }
}

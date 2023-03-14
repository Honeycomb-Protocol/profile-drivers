import {
  Cascade,
  Entity,
  ManyToOne,
  Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { BaseEntity } from "../types/BaseEntity";
import { SteamGame } from "./SteamGame";



@Entity()
export class SteamGameDetail extends BaseEntity<SteamGameDetail> {

  @ManyToOne(() => SteamGame, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    nullable: true,
  })
  appId?: SteamGame;


  @Property()
  totalPlayTimeHours!: number;

  @Property()
  lastPlayedDate!: number;


  @Property()
  singleGameTotalPlayTime!: number;

  @Property()
  singleGameLastPlayedDate!: number;

  @Property()
  winRatioPercent!: number;

  @Property()
  kdratio!: number;

  @Property()
  matches!: number;

  constructor(
    [profile_address, index]: [PublicKey, number],
    totalPlayTimeHours: number,
    lastPlayedDate: number,
    singleGameTotalPlayTime: number,
    singleGameLastPlayedDate: number,
    winRatioPercent: number,
    kdratio: number,
    matches: number,
  ) {
    super(profile_address, index);
    this.totalPlayTimeHours = totalPlayTimeHours;
    this.lastPlayedDate = lastPlayedDate;
    this.singleGameTotalPlayTime = singleGameTotalPlayTime;
    this.singleGameLastPlayedDate = singleGameLastPlayedDate;
    this.winRatioPercent = winRatioPercent;
    this.kdratio = kdratio;
    this.matches = matches;
  }
}

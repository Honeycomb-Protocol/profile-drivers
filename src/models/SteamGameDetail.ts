import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { PublicKey } from '@solana/web3.js'
import { BaseEntity } from '../types/BaseEntity'
import { SteamGame } from './SteamGame'

export interface ISteamGameDetail {
  appId: SteamGame
  totalPlayTimeHours: number
  lastPlayedDate: number
  singleGameTotalPlayTime: number
  singleGameLastPlayedDate: number
  winRatioPercent: number
  kdratio: number
  matches: number
}
@Entity()
export class SteamGameDetail extends BaseEntity<SteamGameDetail> {
  @PrimaryKey()
  appId!: number;
  

  @ManyToOne("SteamGame", {
    joinColumn: "appId", 
    referenceColumnName: "appId", 
    mapToPk: true, 
    nullable: true,
  })
  steamGame?: Ref<"SteamGame">;

  @Property()
  totalPlayTimeHours!: number

  @Property()
  lastPlayedDate!: number

  @Property()
  singleGameTotalPlayTime!: number

  @Property()
  singleGameLastPlayedDate!: number

  @Property()
  winRatioPercent!: number

  @Property()
  kdratio!: number

  @Property()
  matches!: number

  constructor(
    [profile_address, index]: [PublicKey, number],
    appId: number,
    totalPlayTimeHours: number,
    lastPlayedDate: number,
    singleGameTotalPlayTime: number,
    singleGameLastPlayedDate: number,
    winRatioPercent: number,
    kdratio: number,
    matches: number,
  ) {
    super(profile_address, index);
    this.appId = appId
    this.totalPlayTimeHours = totalPlayTimeHours
    this.lastPlayedDate = lastPlayedDate
    this.singleGameTotalPlayTime = singleGameTotalPlayTime
    this.singleGameLastPlayedDate = singleGameLastPlayedDate
    this.winRatioPercent = winRatioPercent
    this.kdratio = kdratio
    this.matches = matches
  }
}

import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { PublicKey } from '@solana/web3.js'
import { BaseEntity, IBaseEntity } from '../types/BaseEntity'
import { SteamGame } from './SteamGame'

export interface ISteamOwnedGames extends IBaseEntity {
  appId: number
  steamGame?: SteamGame,
  playtimeForever: number
  rTimeLastPlayed: number
  playTimeWindowsForever: number
  playTimeMacForever: number
  playTimeLinuxForever: number
}
@Entity()
export class SteamOwnedGames extends BaseEntity<SteamOwnedGames> {
  @Property()
  appId!: number;

  @ManyToOne("SteamGame", {
    joinColumn: "appId", 
    referenceColumnName: "appId", 
    mapToPk: true, 
    nullable: true,
  })
  steamGame?: Ref<"SteamGame">;

  @Property()
  playtimeForever!: number

  @Property()
  rTimeLastPlayed!: number


  @Property()
  playTimeWindowsForever!: number

  @Property()
  playTimeMacForever!: number

  @Property()
  playTimeLinuxForever!: number


  constructor(
    [profile_address, index]: [PublicKey, number],
    appId: number,
    playtimeForever: number,
    rTimeLastPlayed: number,
    playTimeWindowsForever: number,
    playTimeMacForever: number,
    playTimeLinuxForever: number,
  ) {
    super(profile_address, index);
    this.appId = appId
    this.playtimeForever = playtimeForever
    this.rTimeLastPlayed = rTimeLastPlayed
    this.playTimeWindowsForever = playTimeWindowsForever
    this.playTimeMacForever = playTimeMacForever
    this.playTimeLinuxForever = playTimeLinuxForever
  }
}

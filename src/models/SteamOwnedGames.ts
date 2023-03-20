import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { PublicKey } from '@solana/web3.js'
import { ProvableEntity, IProvableEntity } from '../types/ProvableEntity'
import { SteamGame } from './SteamGame'

export interface ISteamOwnedGames extends IProvableEntity {
  app_id: number
  steamGame?: SteamGame,
  playtimeForever: number
  rTimeLastPlayed: number
  playTimeWindowsForever: number
  playTimeMacForever: number
  playTimeLinuxForever: number
}
@Entity()
export class SteamOwnedGames extends ProvableEntity<SteamOwnedGames> {
  @Property()
  app_id!: number;

  @ManyToOne("SteamGame", {
    joinColumn: "app_id", 
    referenceColumnName: "app_id", 
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
    app_id: number,
    playtimeForever: number,
    rTimeLastPlayed: number,
    playTimeWindowsForever: number,
    playTimeMacForever: number,
    playTimeLinuxForever: number,
  ) {
    super(profile_address, index);
    this.app_id = app_id
    this.playtimeForever = playtimeForever
    this.rTimeLastPlayed = rTimeLastPlayed
    this.playTimeWindowsForever = playTimeWindowsForever
    this.playTimeMacForever = playTimeMacForever
    this.playTimeLinuxForever = playTimeLinuxForever
  }
}

import { Cascade, Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { PublicKey } from '@solana/web3.js'
import { ProvableEntity, IProvableEntity } from '../types/ProvableEntity'
import { SteamGame } from './SteamGame'

export interface ISteamAchievements {
  index: number;
  name: string,
  achieved: number,
  unlockTime: number,
  app_id: number,
}
@Entity()
export class SteamAchievements extends ProvableEntity<SteamAchievements> {
  @Property()
  name!: string;
  @Property()
  achieved!: number;

  @Property()
  app_id!: number;
  @Property()
  unlockTime!: number;

  @ManyToOne("SteamGame", {
    joinColumn: "app_id",
    referenceColumnName: "app_id",
    mapToPk: true,
    nullable: true,
  })
  steamGame?: Ref<"SteamGame">;


  constructor(
    [profile_address, index]: [PublicKey, number],
    name: string,
    achieved: number,
    app_id: number,
    unlockTime: number,
  ) {
    super(profile_address, index);
    this.name = name
    this.achieved = achieved
    this.app_id = app_id
    this.unlockTime = unlockTime
  }
}

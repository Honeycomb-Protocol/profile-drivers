import { Cascade, Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { PublicKey } from '@solana/web3.js'
import { ProvableEntity, IProvableEntity } from '../types/ProvableEntity'
import { SteamGame } from './SteamGame'

export interface ISteamGamePlayerStat {
  index: number;
  name: string,
  value: number,
  app_id: number,
}
@Entity()
export class SteamGamePlayerStat extends ProvableEntity<SteamGamePlayerStat> {
  @Property()
  name!: string;
  @Property()
  value!: number;

  @Property()
  app_id!: number;

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
    value: number,
    app_id: number,

  ) {
    super(profile_address, index);
    this.name = name
    this.value = value
    this.app_id = app_id
  }
}

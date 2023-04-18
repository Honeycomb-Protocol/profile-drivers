import {
  Entity,
  PrimaryKey,
  Property,
  BaseEntity,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { Participations } from "./Participations";

export interface IProfile {
  address: PublicKey;
  userAddress: PublicKey;
  wallet: PublicKey;
  identity: string;
  xp: number;
  level: number;
  bounty: number;
  resource1: number;
  resource2: number;
  resource3: number;
}

@Entity()
export class Profile
  extends BaseEntity<Profile, "address">
  implements IProfile
{
  @PrimaryKey()
  address!: PublicKey;

  @Property()
  userAddress!: PublicKey;

  @Property()
  wallet!: PublicKey;

  @Property()
  identity!: string;

  @Property()
  xp!: number;

  @Property()
  level!: number;

  @Property()
  bounty!: number;

  @Property()
  resource1!: number;

  @Property()
  resource2!: number;

  @Property()
  resource3!: number;

  @OneToMany(() => Participations, (participation) => participation.profile)
  participations = new Collection<Participations>(this);

  constructor(profile: IProfile) {
    super();
    this.address = profile.address;
    this.userAddress = profile.userAddress;
    this.wallet = profile.wallet;
    this.identity = profile.identity;
    this.xp = profile.xp;
    this.level = profile.level;
    this.bounty = profile.bounty;
    this.resource1 = profile.xp;
    this.resource2 = profile.resource2;
    this.resource3 = profile.resource3;
  }
}

import {
  Entity,
  PrimaryKey,
  Property,
  BaseEntity,
  ManyToOne,
  Cascade,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { Profile } from "./_Profile";

export interface IParticipation {
  index: number;
  address: PublicKey;
  projectKey: PublicKey;
  wallet: PublicKey;
  mint: PublicKey;
  missionKey: PublicKey;
  startTime: Date;
  endTime: Date;
  bounty: number;
  xp: number;
  resource1: number;
  resource2: number;
  resource3: number;
  token: number;
  calculatedRewards: boolean;
  collectedRewards: boolean;
  isRecalled: number;
}

@Entity()
export class Participations
  extends BaseEntity<Participations, "address">
  implements IParticipation
{
  @Property()
  index!: number;

  @PrimaryKey()
  address!: PublicKey;

  @Property()
  projectKey!: PublicKey;

  @Property()
  wallet!: PublicKey;

  @Property()
  mint!: PublicKey;

  @Property()
  missionKey!: PublicKey;

  @Property()
  startTime!: Date;

  @Property()
  endTime!: Date;

  @Property()
  bounty!: number;

  @Property()
  xp!: number;

  @Property()
  resource1!: number;

  @Property()
  resource2!: number;

  @Property()
  resource3!: number;

  @Property()
  token!: number;

  @Property()
  calculatedRewards!: boolean;

  @Property()
  collectedRewards!: boolean;

  @Property()
  isRecalled!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => Profile, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    nullable: false,
  })
  profile!: Profile;

  constructor(profile_address: PublicKey, participation: IParticipation) {
    super();
    //@ts-ignore
    this.profile = profile_address;

    this.index = participation.index;
    this.address = participation.address;
    this.projectKey = participation.projectKey;
    this.wallet = participation.wallet;
    this.mint = participation.mint;
    this.missionKey = participation.missionKey;
    this.startTime = participation.startTime;
    this.endTime = participation.endTime;
    this.bounty = participation.bounty;
    this.xp = participation.xp;
    this.resource1 = participation.resource1;
    this.resource2 = participation.resource2;
    this.resource3 = participation.resource3;
    this.token = participation.token;
    this.calculatedRewards = participation.calculatedRewards;
    this.collectedRewards = participation.collectedRewards;
    this.isRecalled = participation.isRecalled;
  }
}

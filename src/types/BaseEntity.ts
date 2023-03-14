import {
  ManyToOne,
  Property,
  BaseEntity as MikroBaseEntity,
  PrimaryKey,
  Cascade,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { Profile } from "../models/_Profile";
export interface IBaseEntity {
  _id: number;
  index: number;
  profile?: Profile;
  createdAt: Date;
  updatedAt: Date;
}
export abstract class BaseEntity<
  T extends IBaseEntity
> extends MikroBaseEntity<T, "_id"> {
  @PrimaryKey({ autoincrement: true })
  _id!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  index!: number;

  @ManyToOne(() => Profile, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    nullable: true,
  })
  profile?: Profile;

  constructor(profile_address: PublicKey, index: number) {
    super();
    this.index = index;
    //@ts-ignore
    this.profile = profile_address;
  }
}

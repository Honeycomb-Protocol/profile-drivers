import {
  ManyToOne,
  Property,
  BaseEntity as MikroBaseEntity,
  PrimaryKey,
  Cascade,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";

import { User } from "../models/User";

export abstract class BaseEntity<
  T extends {
    _id: number;
    index: number;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
  }
> extends MikroBaseEntity<T, "_id"> {
  @PrimaryKey({ autoincrement: true })
  _id!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  index!: number;

  @ManyToOne(() => User, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    nullable: true,
  })
  user!: User;

  constructor(user_address: PublicKey, index: number) {
    super();
    this.index = index;
    this.user = new User(user_address);
  }
}

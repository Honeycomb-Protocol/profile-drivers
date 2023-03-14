import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  SerializedPrimaryKey,
  Property,
  Unique,
  Cascade,
  BaseEntity,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { Stats } from "./Stats";

@Entity()
export class User extends BaseEntity<User, "address"> {
  @PrimaryKey()
  address!: PublicKey;

  // @PrimaryKey()
  // address!: string;

  @OneToMany(() => Stats, (stats) => stats.user)
  stats = new Collection<Stats>(this);

  // @OneToMany("Wallet", "user")
  // @OneToMany({ entity: "Wallet", mappedBy: "user" })
  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets = new Collection<Wallet>(this);

  constructor(address: PublicKey) {
    super();
    this.address = address;
  }
}

@Entity()
export class Wallet {
  @PrimaryKey()
  address!: PublicKey;

  // @PrimaryKey()
  // address!: string;

  @Property()
  isPrimary!: boolean;

  @ManyToOne({
    entity: () => User,
    fieldName: "user",
    // joinColumn: "user_address",
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    nullable: true,
  })
  user?: User;
}

import { SteamFriend } from "./SteamFriend";
import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  BaseEntity,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";

export interface IProfile {
  address: PublicKey;
  userAddress: PublicKey;
  identity: string;
  steamUsername?: string;
  steamId?: string;
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
  identity!: string;

  @Property({
    nullable: true,
  })
  steamId!: string;

  @Property({
    nullable: true,
  })
  steamUsername!: string;
  @Property({
    nullable: true,
  })
  steamImage!: string;
  @Property({
    nullable: true,
  })
  steamLevel!: number;
  @Property({
    nullable: true,
  })
  steamCountry!: string;

  @OneToMany(() => SteamFriend, (steamFriend) => steamFriend.profile)
  friends = new Collection<SteamFriend>(this);

  constructor(profile: IProfile) {
    super();
    this.address = profile.address;
    this.userAddress = profile.userAddress;
    this.identity = profile.identity;
  }
}

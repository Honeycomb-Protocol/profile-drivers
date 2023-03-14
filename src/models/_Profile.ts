import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  BaseEntity,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { Stats } from "./Stats";

export interface IWallets {
  primary_wallet: PublicKey;
  secondary_wallets: PublicKey[];
}

export interface IProfile {
  address: PublicKey;
  useraddress: PublicKey;
  wallets: IWallets;
  twitterUsername?: string;
  twitterId?: string;
}

export class Wallets implements IWallets {
  public primary_wallet: PublicKey;
  public secondary_wallets: PublicKey[];

  constructor(input: string = "{}") {
    const parsed = Wallets.parse(input);
    this.primary_wallet = parsed.primary_wallet || PublicKey.default;
    this.secondary_wallets = parsed.secondary_wallets || [];
  }

  public toString(): string {
    return Wallets.stringify(this);
  }

  public static from(wallets: IWallets) {
    return new Wallets(Wallets.stringify(wallets));
  }

  public static parse(input: string) {
    const parsed = {} as IWallets;
    parsed.secondary_wallets = [];

    input.split(";").forEach((wallet) => {
      if (wallet.startsWith("p:")) {
        parsed.primary_wallet = new PublicKey(wallet.replace("p:", ""));
      } else {
        parsed.secondary_wallets.push(new PublicKey(wallet.replace("s:", "")));
      }
    });
    if (!parsed.primary_wallet)
      throw new Error("Primary wallet not found in input");
    return parsed;
  }

  public static stringify(wallets: IWallets) {
    const stringified = [`p:${wallets.primary_wallet.toString()}`];
    wallets.secondary_wallets.forEach((wallet) =>
      stringified.push(`s:${wallet.toString()}`)
    );
    return stringified.join(";");
  }
}

@Entity()
export class Profile
  extends BaseEntity<Profile, "address">
  implements IProfile
{
  @PrimaryKey()
  address!: PublicKey;

  @OneToMany(() => Stats, (stats) => stats.profile)
  stats = new Collection<Stats>(this);

  @Property()
  useraddress!: PublicKey;

  @Property()
  wallets!: Wallets;

  @Property({ nullable: true })
  twitterId?: string;

  @Property({ nullable: true })
  twitterUsername?: string;

  constructor(address: PublicKey) {
    super();
    this.address = address;
  }
}

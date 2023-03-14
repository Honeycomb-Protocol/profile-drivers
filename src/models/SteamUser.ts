import {
    Entity,
    PrimaryKey,
    BaseEntity,
    Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";

export interface ISteamUser {
    steamId: PublicKey;
    image: string;
    name: string;
    level: number;
}

@Entity()
export class SteamUser extends BaseEntity<SteamUser, "steamId"> {
    @PrimaryKey()
    steamId!: PublicKey;

    @Property()
    image!: string;

    @Property()
    name!: string;


    @Property()
    level!: number;

    constructor(steamId: PublicKey, level: number, image: string, name: string) {
        super();
        this.steamId = steamId;
        this.image = image;
        this.name = name;
        this.level = level;
    }
}

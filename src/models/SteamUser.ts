import {
    Entity,
    PrimaryKey,
    BaseEntity,
    Property,
} from "@mikro-orm/core";
import { IProvableEntity } from "../types/ProvableEntity";

export interface ISteamUser extends IProvableEntity {
    steamId: string;
    image: string;
    name: string;
    level?: number;
    loccountrycode: string;
}

@Entity()
export class SteamUser extends BaseEntity<SteamUser, "steamId"> {
    @PrimaryKey()
    steamId!: string;

    @Property()
    image!: string;

    @Property()
    name!: string;

    @Property({nullable: true})
    level?: number;

    @Property()
    loccountrycode!: string;


    constructor(steamId: string, image: string, name: string, loccountrycode: string, level?: number) {
        super();
        this.steamId = steamId;
        this.image = image;
        this.name = name;
        this.level = level;
        this.loccountrycode = loccountrycode;
    }
}

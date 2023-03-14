import {
    Cascade,
    Entity,
    ManyToOne,
    Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { BaseEntity } from "../types/BaseEntity";
import { SteamGame } from "./SteamGame";


@Entity()
export class SteamGameCollectible extends BaseEntity<SteamGameCollectible> {

    @ManyToOne(() => SteamGame, {
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
        nullable: true,
    })
    appId?: SteamGame;

    @Property()
    image!: string;

    @Property()
    name!: string;

    @Property()
    category!: string;


    constructor(
        [profile_address, index]: [PublicKey, number],
        image: string,
        name: string,
        category: string,
    ) {
        super(profile_address, index);
        this.image = image;
        this.name = name;
        this.category = category;
    }
}

import {
    BaseEntity,
    Cascade,
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { SteamGame } from "./SteamGame";

export interface ISteamGameCollectible {
    appId: SteamGame;
    image: string;
    name: string;
    category: string;
    classId: string;
}

@Entity()
export class SteamGameCollectible extends BaseEntity<SteamGameCollectible, 'classId'> {
    @PrimaryKey()
    classId!: string;

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
        image: string,
        name: string,
        category: string,
    ) {
        super();
        this.image = image;
        this.name = name;
        this.category = category;
    }
}

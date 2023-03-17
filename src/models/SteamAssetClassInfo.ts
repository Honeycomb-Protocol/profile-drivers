import * as web3 from "@solana/web3.js"
import {
    Entity,
    PrimaryKey,
    BaseEntity,
    Property,
    OneToMany,
    Collection,
} from "@mikro-orm/core";
import { SteamOwnedCollectible } from "./SteamOwnedCollectible";

export interface ISteamAssetClassInfo {
    classId: string;
    image: string;
    name: string;
    level?: number;
    loccountrycode: string;
}

@Entity()
export class SteamAssetClassInfo extends BaseEntity<SteamAssetClassInfo, "classId"> {
    @PrimaryKey()
    classId!: string;

    @Property()
    icon_url!: string;

    @Property()
    name!: string;

    @Property()
    type!: string;

    @OneToMany("SteamOwnedCollectible", "asset")
    ownedBy = new Collection<SteamOwnedCollectible>(this);
    
    constructor(classId: string, icon_url: string, name: string, type: string) {
        super();
        this.classId = classId;
        this.icon_url = icon_url;
        this.name = name;
        this.type = type;
    }
}

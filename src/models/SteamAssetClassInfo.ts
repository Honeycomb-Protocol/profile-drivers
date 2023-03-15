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
    classid: string;
    image: string;
    name: string;
    level?: number;
    loccountrycode: string;
}

@Entity()
export class SteamAssetClassInfo extends BaseEntity<SteamAssetClassInfo, "classid"> {
    @PrimaryKey()
    classid!: string;

    @Property()
    icon_url!: string;

    @Property()
    name!: string;

    @Property()
    type!: string;

    @OneToMany("SteamOwnedCollectible", "asset")
    ownedBy = new Collection<SteamOwnedCollectible>(this);
    
    constructor(classid: string, icon_url: string, name: string, type: string) {
        super();
        this.classid = classid;
        this.icon_url = icon_url;
        this.name = name;
        this.type = type;
    }
}

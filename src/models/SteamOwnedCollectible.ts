import {
    Cascade,
    Entity,
    ManyToOne,
    Property,
    Ref,
} from "@mikro-orm/core";
import { BaseEntity, IBaseEntity } from "../types/BaseEntity";
import { SteamGame } from "./SteamGame";
import { PublicKey } from '@solana/web3.js'

export interface ISteamGameCollectible extends IBaseEntity {
    appId: SteamGame;
    image: string;
    name: string;
    category: string;
    classId: string;
}

@Entity()
export class SteamOwnedCollectible extends BaseEntity<SteamOwnedCollectible> {
    @Property()
    appId!: string;
  
    @ManyToOne("SteamGame", {
      joinColumn: "appId", 
      referenceColumnName: "appId", 
      mapToPk: true, 
      nullable: true,
    })
    steamGame?: Ref<"SteamGame">;
    
    @Property()
    assetid!: string;
    
    @Property()
    classid!: string;
    
    @ManyToOne("SteamAssetClassInfo", {
        joinColumn: "classid", 
        referenceColumnName: "classid", 
        mapToPk: true, 
        nullable: true,
    })
    asset?: Ref<"SteamAssetClassInfo">;

    @Property()
    amount!: string;

    @Property()
    name!: string;

    @Property()
    category!: string;


    constructor(
        [profile_address, index]: [PublicKey, number],

        appId: string,
        assetid: string,
        classid: string,
        amount: string,
        name: string,
        category: string,
    ) {
        super(profile_address, index);
        this.appId = appId;
        this.assetid = assetid;
        this.classid = classid;
        this.amount = amount;
        this.name = name;
        this.category = category;
    }
}

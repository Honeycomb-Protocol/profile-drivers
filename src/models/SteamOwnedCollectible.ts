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
// "appid": 730,
// "contextid": "2",
// "assetId": "29128402143",
// "classId": "4901046679",
// "instanceid": "0",
// "amount": "1"
export interface ISteamGameCollectible extends IBaseEntity {
    appId: number;
    classId: string;
    assetId: string;
    amount: string;
}

@Entity()
export class SteamOwnedCollectible extends BaseEntity<SteamOwnedCollectible> {
    @Property()
    appId!: number;
  
    @ManyToOne("SteamGame", {
      joinColumn: "appId", 
      referenceColumnName: "appId", 
      mapToPk: true, 
      nullable: true,
    })
    steamGame?: Ref<"SteamGame">;
    
    @Property()
    assetId!: string;
    
    @Property()
    classId!: string;
    
    @ManyToOne("SteamAssetClassInfo", {
        joinColumn: "classId", 
        referenceColumnName: "classId", 
        mapToPk: true, 
        nullable: true,
    })
    asset?: Ref<"SteamAssetClassInfo">;

    @Property()
    amount!: string;


    constructor(
        [profile_address, index]: [PublicKey, number],

        appId: number,
        assetId: string,
        classId: string,
        amount: string,
    ) {
        super(profile_address, index);
        this.appId = appId;
        this.assetId = assetId;
        this.classId = classId;
        this.amount = amount;
    }
}

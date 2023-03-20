import {
    Entity,
    ManyToOne,
    Property,
    Ref,
} from "@mikro-orm/core";
import { ProvableEntity, IProvableEntity } from "../types/ProvableEntity";
import { PublicKey } from '@solana/web3.js'
export interface ISteamGameCollectible extends IProvableEntity {
    app_id: number;
    classId: string;
    assetId: string;
    amount: string;
}

@Entity()
export class SteamOwnedCollectible extends ProvableEntity<SteamOwnedCollectible> {
    @Property()
    app_id!: number;

    @ManyToOne("SteamGame", {
        joinColumn: "app_id",
        referenceColumnName: "app_id",
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
        app_id: number,
        assetId: string,
        classId: string,
        amount: string,
    ) {
        super(profile_address, index);
        this.app_id = app_id;
        this.assetId = assetId;
        this.classId = classId;
        this.amount = amount;
    }
}

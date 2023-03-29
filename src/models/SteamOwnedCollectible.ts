import {
    Cascade,
    Entity,
    ManyToOne,
    Property,
    Ref,
} from "@mikro-orm/core";
import { ProvableEntity, IProvableEntity } from "../types/ProvableEntity";
import { PublicKey } from '@solana/web3.js'
export interface ISteamGameCollectible extends IProvableEntity {
    app_id: number;
    class_id: string;
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
    class_id!: string;

    // @ManyToOne("SteamAssetClassInfo", {
    //     joinColumn: "class_id",
    //     referenceColumnName: "class_id",
    //     mapToPk: true,
    //     nullable: true,
    //     cascade: [Cascade.PERSIST, Cascade.REMOVE],
    // })
    // asset?: Ref<"SteamAssetClassInfo">;

    @Property()
    amount!: string;


    constructor(
        [profile_address, index]: [PublicKey, number],
        app_id: number,
        assetId: string,
        class_id: string,
        amount: string,
    ) {
        super(profile_address, index);
        this.app_id = app_id;
        this.assetId = assetId;
        this.class_id = class_id;
        this.amount = amount;
    }
}

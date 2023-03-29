import {
    Entity,
    PrimaryKey,
    BaseEntity,
    Property,
    OneToMany,
    Collection,
    ManyToOne,
    Ref,
} from "@mikro-orm/core";
import { SteamOwnedCollectible } from "./SteamOwnedCollectible";

export interface ISteamAssetClassInfo {
    class_id: string;
    iconUrl: string;
    name: string;
    type: number;
    ownedBy: number;
}

@Entity()
export class SteamAssetClassInfo extends BaseEntity<SteamAssetClassInfo, "class_id"> {
    @PrimaryKey()
    class_id!: string;

    @Property()
    iconUrl!: string;

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
    name!: string;

    @Property()
    type!: string;

    // @OneToMany("SteamOwnedCollectible", "asset", {
    //     orphanRemoval: true,
    //     nullable: true,
    // })
    ownedBy = new Collection<SteamOwnedCollectible>(this);

    constructor(class_id: string, app_id: number, iconUrl: string, name: string, type: string) {
        super();
        this.class_id = class_id;
        this.app_id = app_id;
        this.iconUrl = iconUrl;
        this.name = name;
        this.type = type;
    }
}

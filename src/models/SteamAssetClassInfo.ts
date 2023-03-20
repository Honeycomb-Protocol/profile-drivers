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
    classId: string;
    iconUrl: string;
    name: string;
    type: number;
    ownedBy: number;
}

@Entity()
export class SteamAssetClassInfo extends BaseEntity<SteamAssetClassInfo, "classId"> {
    @PrimaryKey()
    classId!: string;

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

    @OneToMany("SteamOwnedCollectible", "asset")
    ownedBy = new Collection<SteamOwnedCollectible>(this);

    constructor(classId: string, app_id: number, iconUrl: string, name: string, type: string) {
        super();
        this.classId = classId;
        this.app_id = app_id;
        this.iconUrl = iconUrl;
        this.name = name;
        this.type = type;
    }
}

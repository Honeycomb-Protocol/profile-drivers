import {
    Entity,
    PrimaryKey,
    BaseEntity,
    Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";


@Entity()
export class SteamGame extends BaseEntity<SteamGame, "_appId"> {
    @PrimaryKey()
    _appId!: PublicKey;

    @Property()
    gameImage!: string;

    @Property()
    gameName!: string;


    constructor(_appId: PublicKey, gameImage: string, gameName: string) {
        super();
        this._appId = _appId;
        this.gameImage = gameImage;
        this.gameName = gameName;
    }
}

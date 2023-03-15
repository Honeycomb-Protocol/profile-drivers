import { SteamOwnedGames } from './SteamOwnedGames';
import {
    Entity,
    PrimaryKey,
    Property,
    Collection,
    OneToMany,
    BaseEntity,
} from "@mikro-orm/core";

export interface ISteamGame { 
    appId: number;
    gameImage: string;
    gameName: string;
}

@Entity()
export class SteamGame extends BaseEntity<SteamGame, "appId"> {
    @PrimaryKey()
    appId!: number;


//   @OneToMany(() => Stats, (stats) => stats.profile)
//   stats = new Collection<Stats>(this);
    
    @OneToMany("SteamOwnedGames", "steamGame")
    app = new Collection<SteamOwnedGames>(this);
    
    @Property()
    gameImage!: string;

    @Property()
    gameName!: string;

    constructor(_appId: number, gameImage: string, gameName: string) {
        super();
        this.appId = _appId;
        this.gameImage = gameImage;
        this.gameName = gameName;
    }
}

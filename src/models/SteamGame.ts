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
    app_id: number;
    gameImage: string;
    gameName: string;
}

@Entity()
export class SteamGame extends BaseEntity<SteamGame, "app_id"> {
    @PrimaryKey()
    app_id!: number;


//   @OneToMany(() => Stats, (stats) => stats.profile)
//   stats = new Collection<Stats>(this);
    
    @OneToMany("SteamOwnedGames", "steamGame")
    app = new Collection<SteamOwnedGames>(this);
    
    @Property()
    gameImage!: string;

    @Property()
    gameName!: string;

    constructor(_app_id: number, gameImage: string, gameName: string) {
        super();
        this.app_id = _app_id;
        this.gameImage = gameImage;
        this.gameName = gameName;
    }
}

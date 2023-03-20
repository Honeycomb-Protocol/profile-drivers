import {
  Entity,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { PublicKey } from "@solana/web3.js";
import { ProvableEntity, IProvableEntity } from "../types/ProvableEntity";

export interface ISteamDomainUser extends IProvableEntity {
  steamId: string;
  userName: string;
  userImage: string;
  location: string;
  flag: string;
  level: number;
  recentlyPlayedHours: number;
  totalPlayTimeHours: number;
  numberOfPlayedGames: number;
  averagePlayTimePerGameHours: number;
  countryCode: string;
}

@Entity()
export class SteamDomainUser extends ProvableEntity<SteamDomainUser> {
  @PrimaryKey()
  steamId!: string;

  @Property()
  userName!: string;

  @Property()
  userImage!: string;

  @Property()
  location!: string;

  @Property()
  flag!: string;

  @Property()
  level!: number;

  @Property()
  recentlyPlayedHours!: number;

  @Property()
  totalPlayTimeHours!: number;

  @Property()
  numberOfPlayedGames!: number;

  @Property()
  averagePlayTimePerGameHours!: number;

  @Property()
  countryCode!: string;

  constructor(
    [profile_address, index]: [PublicKey, number],
    steamId: string,
    userName: string,
    userImage: string,
    location: string,
    flag: string,
    level: number,
    recentlyPlayedHours: number,
    totalPlayTimeHours: number,
    numberOfPlayedGames: number,
    averagePlayTimePerGameHours: number,
    countryCode: string,
  ) {
    super(profile_address, index);
    this.steamId = steamId;
    this.userName = userName;
    this.userImage = userImage;
    this.location = location;
    this.flag = flag;
    this.level = level;
    this.recentlyPlayedHours = recentlyPlayedHours;
    this.totalPlayTimeHours = totalPlayTimeHours;
    this.numberOfPlayedGames = numberOfPlayedGames;
    this.averagePlayTimePerGameHours = averagePlayTimePerGameHours;
    this.countryCode = countryCode;
  }
}

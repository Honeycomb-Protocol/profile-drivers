import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../types/BaseEntity";
import { PublicKey } from "@solana/web3.js";

export interface ITweet {
  index: number;
  tweetId: string;
  text: string;
}

@Entity()
export class Tweets extends BaseEntity<Tweets> {
  @PrimaryKey()
  tweetId!: string;

  @Property()
  text!: string;

  constructor(
    [profile_address, index]: [PublicKey, number],
    tweetId: string,
    text: string
  ) {
    super(profile_address, index);
    this.tweetId = tweetId;
    this.text = text;
  }
}

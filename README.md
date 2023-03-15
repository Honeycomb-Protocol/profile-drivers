# profile-drivers
**Do not check main it has just some bootstrap code, full fledge implementation is in Twitter and steam branch**

This repo contains all the drivers maintained by honeycomb team, each driver has specific repo.

These driver uses Honeycomb SDK, Solana compression and MikroORM to store data offchain and store merkle tree onchain so all this data will be verifiable.


There are two kind of entities
- Profile Entities - these entities are basically profile specific entities are the one using compression to store proof.
- Dumb entities - these entities are the one contains supporting data like Steam User Profile Name for example, or metadata cache of collectibles/NFTs.

These branches Also contained the OAuth to validate/connect user profile

Besides this there is one data source fetcher inside the sockets/index.ts

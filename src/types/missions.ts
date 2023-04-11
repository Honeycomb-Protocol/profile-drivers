export type Missions = {
  version: "0.1.0";
  name: "missions";
  instructions: [
    {
      name: "initializeProject";
      accounts: [
        {
          name: "key";
          isMut: false;
          isSigner: false;
          docs: ["The unique identifier of the project"];
        },
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["Payment mint"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault to hold payment tokens"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["The wallet owning the project"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["The program for interacting with the token"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["Rent Account"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System program"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitializeProjectParams";
          };
        }
      ];
    },
    {
      name: "updateProject";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["The wallet owning the project"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "UpdateProjectParams";
          };
        }
      ];
    },
    {
      name: "createMission";
      accounts: [
        {
          name: "project";
          isMut: false;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "key";
          isMut: false;
          isSigner: false;
          docs: ["The unique identifier."];
        },
        {
          name: "mission";
          isMut: true;
          isSigner: false;
          docs: ["The mission account"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["The wallet owning the project"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "CreateMissionParams";
          };
        }
      ];
    },
    {
      name: "updateMission";
      accounts: [
        {
          name: "project";
          isMut: false;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "mission";
          isMut: true;
          isSigner: false;
          docs: ["The mission account"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["The wallet owning the project"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "UpdateMissionParams";
          };
        }
      ];
    },
    {
      name: "deleteMission";
      accounts: [
        {
          name: "project";
          isMut: false;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "mission";
          isMut: true;
          isSigner: false;
          docs: ["The mission account"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["The wallet owning the project"];
        }
      ];
      args: [];
    },
    {
      name: "initializeUserAccount";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user account"];
        },
        {
          name: "wallet";
          isMut: true;
          isSigner: true;
          docs: ["The wallet owning the project"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        }
      ];
      args: [];
    },
    {
      name: "sendOnMission";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "paymentAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user account that holds payment token"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Token Vault"];
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["NFT Mint sending on mission"];
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user account that holds the NFT"];
        },
        {
          name: "depositAccount";
          isMut: true;
          isSigner: false;
          docs: ["The account that will hold the nft sent on mission"];
        },
        {
          name: "participationKey";
          isMut: false;
          isSigner: false;
          docs: ["Unique identifier for the participation."];
        },
        {
          name: "participation";
          isMut: true;
          isSigner: false;
          docs: ["Participation account"];
        },
        {
          name: "mission";
          isMut: false;
          isSigner: false;
          docs: ["The mission where nft is being sent"];
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
          docs: ["Owner of the raffle."];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["Clock account used to know the time"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["The program for interacting with the token"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["Rent Account"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SendOnMissionParams";
          };
        }
      ];
    },
    {
      name: "calculateRewards";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["The global state of the project"];
        },
        {
          name: "participation";
          isMut: true;
          isSigner: false;
          docs: ["Participation account"];
        },
        {
          name: "mission";
          isMut: false;
          isSigner: false;
          docs: ["The mission where nft is being sent"];
        },
        {
          name: "wallet";
          isMut: false;
          isSigner: true;
          docs: ["Owner of the participation."];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["Clock account used to know the time"];
        }
      ];
      args: [];
    },
    {
      name: "claimRewards";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "mission";
          isMut: false;
          isSigner: false;
          docs: ["The Mission participant was sent to"];
        },
        {
          name: "participation";
          isMut: true;
          isSigner: false;
          docs: ["Participation account"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Token Vault"];
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["Token receiving account"];
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user state account to store winnings"];
        },
        {
          name: "wallet";
          isMut: true;
          isSigner: true;
          docs: ["The wallet of the participant"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["Clock account used to know the time"];
        }
      ];
      args: [];
    },
    {
      name: "recallFromMission";
      accounts: [
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["NFT sent on mission"];
        },
        {
          name: "depositAccount";
          isMut: true;
          isSigner: false;
          docs: ["Account holding the NFT sent on mission"];
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["Participant account receiving the NFT"];
        },
        {
          name: "participation";
          isMut: true;
          isSigner: false;
          docs: ["Participation account"];
        },
        {
          name: "wallet";
          isMut: true;
          isSigner: true;
          docs: ["The wallet of the participant"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["Clock account used to know the time"];
        }
      ];
      args: [];
    },
    {
      name: "closeParticipation";
      accounts: [
        {
          name: "participation";
          isMut: true;
          isSigner: false;
          docs: ["Participation account"];
        },
        {
          name: "wallet";
          isMut: true;
          isSigner: true;
          docs: ["The wallet of the participant"];
        }
      ];
      args: [];
    },
    {
      name: "createCity";
      accounts: [
        {
          name: "project";
          isMut: false;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "key";
          isMut: false;
          isSigner: false;
          docs: ["The unique identifier of the city"];
        },
        {
          name: "city";
          isMut: true;
          isSigner: false;
          docs: ["City"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["Owner of the city"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["The clock sysvar account"];
        }
      ];
      args: [];
    },
    {
      name: "createBuilding";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "city";
          isMut: false;
          isSigner: false;
          docs: ["City"];
        },
        {
          name: "building";
          isMut: true;
          isSigner: false;
          docs: ["Building"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["Owner of the building"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "CreateBuildingParams";
          };
        }
      ];
    },
    {
      name: "upgradeBuilding";
      accounts: [
        {
          name: "project";
          isMut: true;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Token Vault"];
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["Token paying account"];
        },
        {
          name: "building";
          isMut: true;
          isSigner: false;
          docs: ["Building"];
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user state account to store winnings"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["Owner of the building"];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["Clock account used to know the time"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System Program"];
        }
      ];
      args: [];
    },
    {
      name: "jackpot";
      accounts: [
        {
          name: "project";
          isMut: false;
          isSigner: false;
          docs: ["Project Info"];
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
          docs: ["The user state account to store winnings"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Token Vault"];
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["Token receiving account"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["Owner of the building"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Token Program"];
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "JackpotParams";
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "project";
      docs: ["Global State of Project"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "key";
            docs: ["the unique identifier of the project"];
            type: "publicKey";
          },
          {
            name: "owner";
            docs: ["The wallet authorized to change information here"];
            type: "publicKey";
          },
          {
            name: "mint";
            docs: ["The mint of token to be accepted as payment"];
            type: "publicKey";
          },
          {
            name: "vault";
            docs: ["The Vault to store payments"];
            type: "publicKey";
          },
          {
            name: "decimals";
            docs: ["The decimals of the token"];
            type: "u8";
          },
          {
            name: "bump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "vaultBump";
            docs: ["The bump used to create the vault"];
            type: "u8";
          },
          {
            name: "root";
            docs: [
              "The root of the merkle tree used to know if a token is part of the collection"
            ];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "buildings";
            docs: ["Building Structures"];
            type: {
              vec: {
                defined: "BuildingStructure";
              };
            };
          }
        ];
      };
    },
    {
      name: "mission";
      docs: ["Mission Type Account"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "projectKey";
            docs: ["Project"];
            type: "publicKey";
          },
          {
            name: "key";
            docs: ["The unique identifier of the mission"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "initialized";
            docs: ["Mission State Flag"];
            type: "bool";
          },
          {
            name: "cost";
            docs: ["Mission Cost"];
            type: "u64";
          },
          {
            name: "xpRequirement";
            docs: ["Mission Requirements"];
            type: "u64";
          },
          {
            name: "duration";
            docs: ["The duration of the mission in seconds"];
            type: "i64";
          },
          {
            name: "minBounty";
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"];
            type: "u64";
          },
          {
            name: "maxBounty";
            type: "u64";
          },
          {
            name: "minXp";
            docs: ["The XP points rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "maxXp";
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "minToken";
            docs: ["The token reward for this mission"];
            type: "u64";
          },
          {
            name: "maxToken";
            type: "u64";
          },
          {
            name: "name";
            docs: ["Mission Name"];
            type: "string";
          }
        ];
      };
    },
    {
      name: "userAccount";
      docs: ["User State Account"];
      type: {
        kind: "struct";
        fields: [
          // {
          //   name: "clanKey";
          //   docs: ["The unique identifier of the clan if there is"];
          //   type: {
          //     option: "publicKey";
          //   };
          // },
          {
            name: "wallet";
            docs: ["The wallet of the user"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "bounty";
            docs: ["Bounty"];
            type: "u64";
          },
          {
            name: "xp";
            docs: ["XP earned by user"];
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource"];
            type: "u64";
          }
        ];
      };
    },
    {
      name: "participation";
      docs: ["User Resource Holding Account"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "projectKey";
            docs: ["The unique Identifier of the project"];
            type: "publicKey";
          },
          {
            name: "wallet";
            docs: ["User Wallet"];
            type: "publicKey";
          },
          {
            name: "key";
            docs: ["The unique identifier of the participation"];
            type: "publicKey";
          },
          {
            name: "participationBump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "depositBump";
            docs: ["The bump used to create deposit account PDA"];
            type: "u8";
          },
          {
            name: "mint";
            docs: ["The mint address of the token sent on mission"];
            type: "publicKey";
          },
          {
            name: "missionKey";
            docs: ["The mission key"];
            type: "publicKey";
          },
          {
            name: "startTime";
            docs: ["The start time of the mission in unix timestamp"];
            type: "i64";
          },
          {
            name: "endTime";
            docs: [
              "The end time of the mission in unix timestamp",
              "It is calculated by start_time + mission.duration"
            ];
            type: "i64";
          },
          {
            name: "bounty";
            docs: ["The winning bounty quantity"];
            type: "u64";
          },
          {
            name: "xp";
            docs: ["The winning XP quantity"];
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["The winning Ammo Resource quantity"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["The winning Food Resource quantity"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["The winning Gem Resource quantity"];
            type: "u64";
          },
          {
            name: "token";
            docs: ["The winning tokens"];
            type: "u64";
          },
          {
            name: "calculatedRewards";
            docs: ["Flag if already calculated rewards"];
            type: "bool";
          },
          {
            name: "collectedRewards";
            docs: ["Flag if reward collected"];
            type: "bool";
          },
          {
            name: "isRecalled";
            docs: ["Flag if the NFT is recalled from the mission", "boolean"];
            type: "u8";
          }
        ];
      };
    },
    {
      name: "city";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            docs: ["The wallet owning the city"];
            type: "publicKey";
          },
          {
            name: "projectKey";
            docs: ["The unique identifier of the project"];
            type: "publicKey";
          },
          {
            name: "key";
            docs: ["The unique identifier of the city"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "level";
            docs: ["The level of the city"];
            type: "u8";
          },
          {
            name: "defense";
            docs: ["The defense of the city"];
            type: "u64";
          },
          {
            name: "constructionEnd";
            docs: ["Construction end"];
            type: "i64";
          },
          {
            name: "active";
            docs: ["Flag to indicate if city is active"];
            type: "bool";
          },
          {
            name: "destroyed";
            docs: ["Flag to indicate if city is destroyed"];
            type: "bool";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource"];
            type: "u64";
          },
          {
            name: "token";
            docs: ["The tokens might be lootable"];
            type: "u64";
          }
        ];
      };
    },
    {
      name: "building";
      docs: ["Building"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            docs: ["Owner of the building"];
            type: "publicKey";
          },
          {
            name: "cityKey";
            docs: ["The city to which the building belongs"];
            type: "publicKey";
          },
          {
            name: "buildingType";
            docs: ["Building Type"];
            type: "u8";
          },
          {
            name: "bump";
            docs: ["Bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "constructionEnd";
            docs: [
              "The end time of the building in unix timestamp",
              "It is calculated by start_time + building_structure.duration"
            ];
            type: "i64";
          },
          {
            name: "level";
            docs: ["Building XP"];
            type: "u8";
          },
          {
            name: "weight";
            docs: ["Weight on the level"];
            type: "u16";
          },
          {
            name: "resource1";
            docs: ["Resources used last time to upgrade the building"];
            type: "u64";
          },
          {
            name: "resource2";
            type: "u64";
          },
          {
            name: "resource3";
            type: "u64";
          },
          {
            name: "tokens";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "clan";
      docs: ["Clan"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "projectKey";
            docs: ["The unique identifier of the project"];
            type: "publicKey";
          },
          {
            name: "leader";
            docs: ["The leader of the clan"];
            type: "publicKey";
          },
          {
            name: "key";
            docs: ["The unique identifier of the clan"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["The bump used to create this PDA"];
            type: "u8";
          },
          {
            name: "active";
            docs: ["Flag to indicate if clan is active"];
            type: "bool";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource"];
            type: "u64";
          },
          {
            name: "token";
            docs: ["The tokens might be lootable"];
            type: "u64";
          },
          {
            name: "name";
            docs: ["The name of the clan"];
            type: "string";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitializeProjectParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "root";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "buildings";
            type: {
              vec: {
                defined: "BuildingStructure";
              };
            };
          }
        ];
      };
    },
    {
      name: "UpdateProjectParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "root";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "buildings";
            type: {
              vec: {
                defined: "BuildingStructure";
              };
            };
          }
        ];
      };
    },
    {
      name: "CreateMissionParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            docs: ["Mission Name"];
            type: "string";
          },
          {
            name: "cost";
            docs: ["Mission Cost"];
            type: "u64";
          },
          {
            name: "xpRequirement";
            docs: ["Mission Requirements"];
            type: "u64";
          },
          {
            name: "duration";
            docs: ["The duration of the mission in seconds"];
            type: "i64";
          },
          {
            name: "minBounty";
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"];
            type: "u64";
          },
          {
            name: "maxBounty";
            type: "u64";
          },
          {
            name: "minXp";
            docs: ["The XP points rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "maxXp";
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "minToken";
            docs: ["The token reward for this mission"];
            type: "u64";
          },
          {
            name: "maxToken";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UpdateMissionParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            docs: ["Mission Name"];
            type: "string";
          },
          {
            name: "cost";
            docs: ["Mission Cost"];
            type: "u64";
          },
          {
            name: "xpRequirement";
            docs: ["Mission Requirements"];
            type: "u64";
          },
          {
            name: "duration";
            docs: ["The duration of the mission in seconds"];
            type: "i64";
          },
          {
            name: "minBounty";
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"];
            type: "u64";
          },
          {
            name: "maxBounty";
            type: "u64";
          },
          {
            name: "minXp";
            docs: ["The XP points rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "maxXp";
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["Ammo Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Food Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Gem Resource rewarded if completed this mission"];
            type: "u64";
          },
          {
            name: "minToken";
            docs: ["The token reward for this mission"];
            type: "u64";
          },
          {
            name: "maxToken";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "SendOnMissionParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "merkleProof";
            type: {
              vec: {
                array: ["u8", 32];
              };
            };
          }
        ];
      };
    },
    {
      name: "CreateBuildingParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "buildingType";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "JackpotParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bounty";
            type: "u64";
          },
          {
            name: "xp";
            type: "u64";
          },
          {
            name: "resource1";
            type: "u64";
          },
          {
            name: "resource2";
            type: "u64";
          },
          {
            name: "resource3";
            type: "u64";
          },
          {
            name: "token";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "BuildingStructure";
      type: {
        kind: "struct";
        fields: [
          {
            name: "buildingType";
            docs: ["Building Type"];
            type: "u8";
          },
          {
            name: "weight";
            type: "u16";
          },
          {
            name: "xpRequirement";
            docs: ["Requirements of the building"];
            type: "u64";
          },
          {
            name: "tokens";
            docs: ["Cost of the construction in tokens"];
            type: "u64";
          },
          {
            name: "resource1";
            docs: ["Cost of construction in resource 1 (Ammo)"];
            type: "u64";
          },
          {
            name: "resource2";
            docs: ["Cost of construction in resource 2 (Food)"];
            type: "u64";
          },
          {
            name: "resource3";
            docs: ["Cost of construction in resource 3 (Gem)"];
            type: "u64";
          },
          {
            name: "resource3Skip";
            docs: ["Skip the first this levels"];
            type: "u8";
          },
          {
            name: "duration";
            docs: ["Time in milliseconds to construct the building"];
            type: "i64";
          },
          {
            name: "minToken";
            docs: ["Token reward"];
            type: "u64";
          },
          {
            name: "maxToken";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "BuildingError";
      type: {
        kind: "enum";
        variants: [
          {
            name: "InvalidBuildingType";
          },
          {
            name: "NotEnoughResources";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidProof";
      msg: "The NFT doesn't belong to this collection";
    },
    {
      code: 6001;
      name: "AlreadyInitialized";
      msg: "The Mission is already initialized cannot change data for this mission!";
    },
    {
      code: 6002;
      name: "RewardsAlreadyCalculated";
      msg: "Rewards already calculated for this participations";
    },
    {
      code: 6003;
      name: "AlreadyRecalled";
      msg: "NFT already recalled from this mission participation!";
    },
    {
      code: 6004;
      name: "MissionNotEnded";
      msg: "Mission not ended yet!";
    },
    {
      code: 6005;
      name: "RewardsNotCollected";
      msg: "Please collect your rewards first";
    },
    {
      code: 6006;
      name: "RewardsAlreadyCollected";
      msg: "Rewards already Collected";
    },
    {
      code: 6007;
      name: "Overflow";
      msg: "Operation overflowed";
    }
  ];
};

export const MissionsIDL: Missions = {
  version: "0.1.0",
  name: "missions",
  instructions: [
    {
      name: "initializeProject",
      accounts: [
        {
          name: "key",
          isMut: false,
          isSigner: false,
          docs: ["The unique identifier of the project"],
        },
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["Payment mint"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault to hold payment tokens"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["The program for interacting with the token"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["Rent Account"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System program"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitializeProjectParams",
          },
        },
      ],
    },
    {
      name: "updateProject",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "UpdateProjectParams",
          },
        },
      ],
    },
    {
      name: "createMission",
      accounts: [
        {
          name: "project",
          isMut: false,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "key",
          isMut: false,
          isSigner: false,
          docs: ["The unique identifier."],
        },
        {
          name: "mission",
          isMut: true,
          isSigner: false,
          docs: ["The mission account"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "CreateMissionParams",
          },
        },
      ],
    },
    {
      name: "updateMission",
      accounts: [
        {
          name: "project",
          isMut: false,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "mission",
          isMut: true,
          isSigner: false,
          docs: ["The mission account"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "UpdateMissionParams",
          },
        },
      ],
    },
    {
      name: "deleteMission",
      accounts: [
        {
          name: "project",
          isMut: false,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "mission",
          isMut: true,
          isSigner: false,
          docs: ["The mission account"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
      ],
      args: [],
    },
    {
      name: "initializeUserAccount",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user account"],
        },
        {
          name: "wallet",
          isMut: true,
          isSigner: true,
          docs: ["The wallet owning the project"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
      ],
      args: [],
    },
    {
      name: "sendOnMission",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "paymentAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user account that holds payment token"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Token Vault"],
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["NFT Mint sending on mission"],
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user account that holds the NFT"],
        },
        {
          name: "depositAccount",
          isMut: true,
          isSigner: false,
          docs: ["The account that will hold the nft sent on mission"],
        },
        {
          name: "participationKey",
          isMut: false,
          isSigner: false,
          docs: ["Unique identifier for the participation."],
        },
        {
          name: "participation",
          isMut: true,
          isSigner: false,
          docs: ["Participation account"],
        },
        {
          name: "mission",
          isMut: false,
          isSigner: false,
          docs: ["The mission where nft is being sent"],
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
          docs: ["Owner of the raffle."],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["Clock account used to know the time"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["The program for interacting with the token"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["Rent Account"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SendOnMissionParams",
          },
        },
      ],
    },
    {
      name: "calculateRewards",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["The global state of the project"],
        },
        {
          name: "participation",
          isMut: true,
          isSigner: false,
          docs: ["Participation account"],
        },
        {
          name: "mission",
          isMut: false,
          isSigner: false,
          docs: ["The mission where nft is being sent"],
        },
        {
          name: "wallet",
          isMut: false,
          isSigner: true,
          docs: ["Owner of the participation."],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["Clock account used to know the time"],
        },
      ],
      args: [],
    },
    {
      name: "claimRewards",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "mission",
          isMut: false,
          isSigner: false,
          docs: ["The Mission participant was sent to"],
        },
        {
          name: "participation",
          isMut: true,
          isSigner: false,
          docs: ["Participation account"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Token Vault"],
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["Token receiving account"],
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user state account to store winnings"],
        },
        {
          name: "wallet",
          isMut: true,
          isSigner: true,
          docs: ["The wallet of the participant"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["Clock account used to know the time"],
        },
      ],
      args: [],
    },
    {
      name: "recallFromMission",
      accounts: [
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["NFT sent on mission"],
        },
        {
          name: "depositAccount",
          isMut: true,
          isSigner: false,
          docs: ["Account holding the NFT sent on mission"],
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["Participant account receiving the NFT"],
        },
        {
          name: "participation",
          isMut: true,
          isSigner: false,
          docs: ["Participation account"],
        },
        {
          name: "wallet",
          isMut: true,
          isSigner: true,
          docs: ["The wallet of the participant"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["Clock account used to know the time"],
        },
      ],
      args: [],
    },
    {
      name: "closeParticipation",
      accounts: [
        {
          name: "participation",
          isMut: true,
          isSigner: false,
          docs: ["Participation account"],
        },
        {
          name: "wallet",
          isMut: true,
          isSigner: true,
          docs: ["The wallet of the participant"],
        },
      ],
      args: [],
    },
    {
      name: "createCity",
      accounts: [
        {
          name: "project",
          isMut: false,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "key",
          isMut: false,
          isSigner: false,
          docs: ["The unique identifier of the city"],
        },
        {
          name: "city",
          isMut: true,
          isSigner: false,
          docs: ["City"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["Owner of the city"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["The clock sysvar account"],
        },
      ],
      args: [],
    },
    {
      name: "createBuilding",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "city",
          isMut: false,
          isSigner: false,
          docs: ["City"],
        },
        {
          name: "building",
          isMut: true,
          isSigner: false,
          docs: ["Building"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["Owner of the building"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "CreateBuildingParams",
          },
        },
      ],
    },
    {
      name: "upgradeBuilding",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Token Vault"],
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["Token paying account"],
        },
        {
          name: "building",
          isMut: true,
          isSigner: false,
          docs: ["Building"],
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user state account to store winnings"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["Owner of the building"],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["Clock account used to know the time"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System Program"],
        },
      ],
      args: [],
    },
    {
      name: "jackpot",
      accounts: [
        {
          name: "project",
          isMut: false,
          isSigner: false,
          docs: ["Project Info"],
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
          docs: ["The user state account to store winnings"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Token Vault"],
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["Token receiving account"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["Owner of the building"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Token Program"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "JackpotParams",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "project",
      docs: ["Global State of Project"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "key",
            docs: ["the unique identifier of the project"],
            type: "publicKey",
          },
          {
            name: "owner",
            docs: ["The wallet authorized to change information here"],
            type: "publicKey",
          },
          {
            name: "mint",
            docs: ["The mint of token to be accepted as payment"],
            type: "publicKey",
          },
          {
            name: "vault",
            docs: ["The Vault to store payments"],
            type: "publicKey",
          },
          {
            name: "decimals",
            docs: ["The decimals of the token"],
            type: "u8",
          },
          {
            name: "bump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "vaultBump",
            docs: ["The bump used to create the vault"],
            type: "u8",
          },
          {
            name: "root",
            docs: [
              "The root of the merkle tree used to know if a token is part of the collection",
            ],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "buildings",
            docs: ["Building Structures"],
            type: {
              vec: {
                defined: "BuildingStructure",
              },
            },
          },
        ],
      },
    },
    {
      name: "mission",
      docs: ["Mission Type Account"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "projectKey",
            docs: ["Project"],
            type: "publicKey",
          },
          {
            name: "key",
            docs: ["The unique identifier of the mission"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "initialized",
            docs: ["Mission State Flag"],
            type: "bool",
          },
          {
            name: "cost",
            docs: ["Mission Cost"],
            type: "u64",
          },
          {
            name: "xpRequirement",
            docs: ["Mission Requirements"],
            type: "u64",
          },
          {
            name: "duration",
            docs: ["The duration of the mission in seconds"],
            type: "i64",
          },
          {
            name: "minBounty",
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"],
            type: "u64",
          },
          {
            name: "maxBounty",
            type: "u64",
          },
          {
            name: "minXp",
            docs: ["The XP points rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "maxXp",
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "minToken",
            docs: ["The token reward for this mission"],
            type: "u64",
          },
          {
            name: "maxToken",
            type: "u64",
          },
          {
            name: "name",
            docs: ["Mission Name"],
            type: "string",
          },
        ],
      },
    },
    {
      name: "userAccount",
      docs: ["User State Account"],
      type: {
        kind: "struct",
        fields: [
          // {
          //   name: "clanKey",
          //   docs: ["The unique identifier of the clan if there is"],
          //   type: {
          //     option: "publicKey",
          //   },
          // },
          {
            name: "wallet",
            docs: ["The wallet of the user"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "bounty",
            docs: ["Bounty"],
            type: "u64",
          },
          {
            name: "xp",
            docs: ["XP earned by user"],
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource"],
            type: "u64",
          },
        ],
      },
    },
    {
      name: "participation",
      docs: ["User Resource Holding Account"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "projectKey",
            docs: ["The unique Identifier of the project"],
            type: "publicKey",
          },
          {
            name: "wallet",
            docs: ["User Wallet"],
            type: "publicKey",
          },
          {
            name: "key",
            docs: ["The unique identifier of the participation"],
            type: "publicKey",
          },
          {
            name: "participationBump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "depositBump",
            docs: ["The bump used to create deposit account PDA"],
            type: "u8",
          },
          {
            name: "mint",
            docs: ["The mint address of the token sent on mission"],
            type: "publicKey",
          },
          {
            name: "missionKey",
            docs: ["The mission key"],
            type: "publicKey",
          },
          {
            name: "startTime",
            docs: ["The start time of the mission in unix timestamp"],
            type: "i64",
          },
          {
            name: "endTime",
            docs: [
              "The end time of the mission in unix timestamp",
              "It is calculated by start_time + mission.duration",
            ],
            type: "i64",
          },
          {
            name: "bounty",
            docs: ["The winning bounty quantity"],
            type: "u64",
          },
          {
            name: "xp",
            docs: ["The winning XP quantity"],
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["The winning Ammo Resource quantity"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["The winning Food Resource quantity"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["The winning Gem Resource quantity"],
            type: "u64",
          },
          {
            name: "token",
            docs: ["The winning tokens"],
            type: "u64",
          },
          {
            name: "calculatedRewards",
            docs: ["Flag if already calculated rewards"],
            type: "bool",
          },
          {
            name: "collectedRewards",
            docs: ["Flag if reward collected"],
            type: "bool",
          },
          {
            name: "isRecalled",
            docs: ["Flag if the NFT is recalled from the mission", "boolean"],
            type: "u8",
          },
        ],
      },
    },
    {
      name: "city",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            docs: ["The wallet owning the city"],
            type: "publicKey",
          },
          {
            name: "projectKey",
            docs: ["The unique identifier of the project"],
            type: "publicKey",
          },
          {
            name: "key",
            docs: ["The unique identifier of the city"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "level",
            docs: ["The level of the city"],
            type: "u8",
          },
          {
            name: "defense",
            docs: ["The defense of the city"],
            type: "u64",
          },
          {
            name: "constructionEnd",
            docs: ["Construction end"],
            type: "i64",
          },
          {
            name: "active",
            docs: ["Flag to indicate if city is active"],
            type: "bool",
          },
          {
            name: "destroyed",
            docs: ["Flag to indicate if city is destroyed"],
            type: "bool",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource"],
            type: "u64",
          },
          {
            name: "token",
            docs: ["The tokens might be lootable"],
            type: "u64",
          },
        ],
      },
    },
    {
      name: "building",
      docs: ["Building"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            docs: ["Owner of the building"],
            type: "publicKey",
          },
          {
            name: "cityKey",
            docs: ["The city to which the building belongs"],
            type: "publicKey",
          },
          {
            name: "buildingType",
            docs: ["Building Type"],
            type: "u8",
          },
          {
            name: "bump",
            docs: ["Bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "constructionEnd",
            docs: [
              "The end time of the building in unix timestamp",
              "It is calculated by start_time + building_structure.duration",
            ],
            type: "i64",
          },
          {
            name: "level",
            docs: ["Building XP"],
            type: "u8",
          },
          {
            name: "weight",
            docs: ["Weight on the level"],
            type: "u16",
          },
          {
            name: "resource1",
            docs: ["Resources used last time to upgrade the building"],
            type: "u64",
          },
          {
            name: "resource2",
            type: "u64",
          },
          {
            name: "resource3",
            type: "u64",
          },
          {
            name: "tokens",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "clan",
      docs: ["Clan"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "projectKey",
            docs: ["The unique identifier of the project"],
            type: "publicKey",
          },
          {
            name: "leader",
            docs: ["The leader of the clan"],
            type: "publicKey",
          },
          {
            name: "key",
            docs: ["The unique identifier of the clan"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["The bump used to create this PDA"],
            type: "u8",
          },
          {
            name: "active",
            docs: ["Flag to indicate if clan is active"],
            type: "bool",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource"],
            type: "u64",
          },
          {
            name: "token",
            docs: ["The tokens might be lootable"],
            type: "u64",
          },
          {
            name: "name",
            docs: ["The name of the clan"],
            type: "string",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitializeProjectParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "root",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "buildings",
            type: {
              vec: {
                defined: "BuildingStructure",
              },
            },
          },
        ],
      },
    },
    {
      name: "UpdateProjectParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "root",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "buildings",
            type: {
              vec: {
                defined: "BuildingStructure",
              },
            },
          },
        ],
      },
    },
    {
      name: "CreateMissionParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            docs: ["Mission Name"],
            type: "string",
          },
          {
            name: "cost",
            docs: ["Mission Cost"],
            type: "u64",
          },
          {
            name: "xpRequirement",
            docs: ["Mission Requirements"],
            type: "u64",
          },
          {
            name: "duration",
            docs: ["The duration of the mission in seconds"],
            type: "i64",
          },
          {
            name: "minBounty",
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"],
            type: "u64",
          },
          {
            name: "maxBounty",
            type: "u64",
          },
          {
            name: "minXp",
            docs: ["The XP points rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "maxXp",
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "minToken",
            docs: ["The token reward for this mission"],
            type: "u64",
          },
          {
            name: "maxToken",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateMissionParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            docs: ["Mission Name"],
            type: "string",
          },
          {
            name: "cost",
            docs: ["Mission Cost"],
            type: "u64",
          },
          {
            name: "xpRequirement",
            docs: ["Mission Requirements"],
            type: "u64",
          },
          {
            name: "duration",
            docs: ["The duration of the mission in seconds"],
            type: "i64",
          },
          {
            name: "minBounty",
            docs: ["The Bounty reward for the mission", "In decimals 100 = 1"],
            type: "u64",
          },
          {
            name: "maxBounty",
            type: "u64",
          },
          {
            name: "minXp",
            docs: ["The XP points rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "maxXp",
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["Ammo Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Food Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Gem Resource rewarded if completed this mission"],
            type: "u64",
          },
          {
            name: "minToken",
            docs: ["The token reward for this mission"],
            type: "u64",
          },
          {
            name: "maxToken",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SendOnMissionParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "merkleProof",
            type: {
              vec: {
                array: ["u8", 32],
              },
            },
          },
        ],
      },
    },
    {
      name: "CreateBuildingParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "buildingType",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "JackpotParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bounty",
            type: "u64",
          },
          {
            name: "xp",
            type: "u64",
          },
          {
            name: "resource1",
            type: "u64",
          },
          {
            name: "resource2",
            type: "u64",
          },
          {
            name: "resource3",
            type: "u64",
          },
          {
            name: "token",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BuildingStructure",
      type: {
        kind: "struct",
        fields: [
          {
            name: "buildingType",
            docs: ["Building Type"],
            type: "u8",
          },
          {
            name: "weight",
            type: "u16",
          },
          {
            name: "xpRequirement",
            docs: ["Requirements of the building"],
            type: "u64",
          },
          {
            name: "tokens",
            docs: ["Cost of the construction in tokens"],
            type: "u64",
          },
          {
            name: "resource1",
            docs: ["Cost of construction in resource 1 (Ammo)"],
            type: "u64",
          },
          {
            name: "resource2",
            docs: ["Cost of construction in resource 2 (Food)"],
            type: "u64",
          },
          {
            name: "resource3",
            docs: ["Cost of construction in resource 3 (Gem)"],
            type: "u64",
          },
          {
            name: "resource3Skip",
            docs: ["Skip the first this levels"],
            type: "u8",
          },
          {
            name: "duration",
            docs: ["Time in milliseconds to construct the building"],
            type: "i64",
          },
          {
            name: "minToken",
            docs: ["Token reward"],
            type: "u64",
          },
          {
            name: "maxToken",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BuildingError",
      type: {
        kind: "enum",
        variants: [
          {
            name: "InvalidBuildingType",
          },
          {
            name: "NotEnoughResources",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidProof",
      msg: "The NFT doesn't belong to this collection",
    },
    {
      code: 6001,
      name: "AlreadyInitialized",
      msg: "The Mission is already initialized cannot change data for this mission!",
    },
    {
      code: 6002,
      name: "RewardsAlreadyCalculated",
      msg: "Rewards already calculated for this participations",
    },
    {
      code: 6003,
      name: "AlreadyRecalled",
      msg: "NFT already recalled from this mission participation!",
    },
    {
      code: 6004,
      name: "MissionNotEnded",
      msg: "Mission not ended yet!",
    },
    {
      code: 6005,
      name: "RewardsNotCollected",
      msg: "Please collect your rewards first",
    },
    {
      code: 6006,
      name: "RewardsAlreadyCollected",
      msg: "Rewards already Collected",
    },
    {
      code: 6007,
      name: "Overflow",
      msg: "Operation overflowed",
    },
  ],
};

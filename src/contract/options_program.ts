/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/options_program.json`.
 */
export type OptionsProgram = {
  "address": "3ZWb72v75w19dvHjwsqxe6gdK3yvU6p645PPEFpCSzHg",
  "metadata": {
    "name": "optionsProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "userTokenAcc",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_ix"
              }
            ]
          }
        },
        {
          "name": "protocolFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_ix"
              }
            ]
          }
        },
        {
          "name": "assetMint"
        },
        {
          "name": "priceUpdate"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "buyOptionParams"
            }
          }
        }
      ]
    },
    {
      "name": "closeMarket",
      "discriminator": [
        88,
        154,
        248,
        186,
        48,
        14,
        123,
        244
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "assetMint"
        },
        {
          "name": "adminAssetAta",
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "protocolFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "closeMarketParams"
            }
          }
        }
      ]
    },
    {
      "name": "createAccount",
      "discriminator": [
        99,
        20,
        130,
        119,
        196,
        235,
        131,
        149
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "assetMint"
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "protocolFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createMarketParams"
            }
          }
        }
      ]
    },
    {
      "name": "exercise",
      "discriminator": [
        144,
        79,
        103,
        64,
        241,
        78,
        80,
        174
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "userTokenAcc",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_ix"
              }
            ]
          }
        },
        {
          "name": "assetMint"
        },
        {
          "name": "priceUpdate"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "exerciseOptionParams"
            }
          }
        }
      ]
    },
    {
      "name": "marketDeposit",
      "discriminator": [
        231,
        55,
        143,
        187,
        144,
        8,
        25,
        94
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAssetAta",
          "writable": true
        },
        {
          "name": "userLpAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "assetMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "depositIx"
            }
          }
        }
      ]
    },
    {
      "name": "marketWithdraw",
      "discriminator": [
        193,
        55,
        177,
        97,
        238,
        123,
        115,
        121
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAssetAta",
          "writable": true
        },
        {
          "name": "userLpAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "assetMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "withdrawParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateMarketVol",
      "discriminator": [
        196,
        210,
        98,
        172,
        255,
        112,
        230,
        144
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateMarketVolParams"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawFees",
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminTokenAcc",
          "writable": true
        },
        {
          "name": "assetMint"
        },
        {
          "name": "protocolFeesVault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.ix"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "withdrawFeesParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "priceUpdateV2",
      "discriminator": [
        34,
        241,
        35,
        99,
        157,
        126,
        244,
        205
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    }
  ],
  "events": [
    {
      "name": "makerDepositEvent",
      "discriminator": [
        17,
        76,
        13,
        254,
        224,
        143,
        218,
        160
      ]
    },
    {
      "name": "makerWithdrawEvent",
      "discriminator": [
        98,
        73,
        129,
        66,
        221,
        59,
        77,
        255
      ]
    },
    {
      "name": "optionBought",
      "discriminator": [
        30,
        211,
        229,
        0,
        95,
        254,
        107,
        204
      ]
    },
    {
      "name": "optionExercised",
      "discriminator": [
        34,
        100,
        89,
        14,
        247,
        159,
        22,
        97
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "slippageExceeded",
      "msg": "slippageExceeded"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "invalidAmount"
    },
    {
      "code": 6003,
      "name": "invalidQuantity",
      "msg": "invalidQuantity"
    },
    {
      "code": 6004,
      "name": "dustAmount",
      "msg": "dustAmount"
    },
    {
      "code": 6005,
      "name": "overflow",
      "msg": "overflow"
    },
    {
      "code": 6006,
      "name": "underflow",
      "msg": "underflow"
    },
    {
      "code": 6007,
      "name": "ordersLimitExceeded",
      "msg": "ordersLimitExceeded"
    },
    {
      "code": 6008,
      "name": "invalidExpiry",
      "msg": "invalidExpiry"
    },
    {
      "code": 6009,
      "name": "insufficientColateral",
      "msg": "insufficientColateral"
    },
    {
      "code": 6010,
      "name": "invalidPriceFeed",
      "msg": "invalidPriceFeed"
    },
    {
      "code": 6011,
      "name": "exerciseIsOverdue",
      "msg": "exerciseIsOverdue"
    },
    {
      "code": 6012,
      "name": "exerciseTooEarly",
      "msg": "exerciseTooEarly"
    },
    {
      "code": 6013,
      "name": "insufficientShares",
      "msg": "insufficientShares"
    },
    {
      "code": 6014,
      "name": "invalidState",
      "msg": "invalidState"
    },
    {
      "code": 6015,
      "name": "premiumCalcError",
      "msg": "premiumCalcError"
    },
    {
      "code": 6016,
      "name": "invalidPrices",
      "msg": "invalidPrices"
    },
    {
      "code": 6017,
      "name": "cannotWithdraw",
      "msg": "Cannot withdraw. Funds are collateral to active options"
    },
    {
      "code": 6018,
      "name": "notImplemented",
      "msg": "notImplemented"
    },
    {
      "code": 6019,
      "name": "invalidStrikePrice",
      "msg": "invalidStrikePrice"
    },
    {
      "code": 6020,
      "name": "invalidVolatility",
      "msg": "invalidVolatility"
    },
    {
      "code": 6021,
      "name": "volatilityStaled",
      "msg": "volatilityStaled"
    },
    {
      "code": 6022,
      "name": "invalidSpotPrice",
      "msg": "invalidSpotPrice"
    }
  ],
  "types": [
    {
      "name": "buyOptionParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIx",
            "type": "u16"
          },
          {
            "name": "option",
            "type": {
              "defined": {
                "name": "optionType"
              }
            }
          },
          {
            "name": "spotDeviation",
            "type": {
              "defined": {
                "name": "spotDeviation"
              }
            }
          },
          {
            "name": "expirySetting",
            "type": {
              "defined": {
                "name": "expiry"
              }
            }
          },
          {
            "name": "quantity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "closeMarketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ix",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "createMarketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ix",
            "type": "u16"
          },
          {
            "name": "priceFeed",
            "type": "string"
          },
          {
            "name": "hour1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "hour4VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day3VolatilityBps",
            "type": "u32"
          },
          {
            "name": "weekVolatilityBps",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "depositIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "minAmountOut",
            "type": "u64"
          },
          {
            "name": "ix",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "exerciseOptionParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketIx",
            "type": "u16"
          },
          {
            "name": "optionId",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "expiry",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "hour1"
          },
          {
            "name": "hour4"
          },
          {
            "name": "day1"
          },
          {
            "name": "day3"
          },
          {
            "name": "week"
          }
        ]
      }
    },
    {
      "name": "makerDepositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "u16"
          },
          {
            "name": "marketName",
            "type": "string"
          },
          {
            "name": "marketAssetMint",
            "type": "pubkey"
          },
          {
            "name": "marketReserveBefore",
            "type": "u64"
          },
          {
            "name": "marketReserveAfter",
            "type": "u64"
          },
          {
            "name": "tokensDeposited",
            "type": "u64"
          },
          {
            "name": "lpTokensMinted",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "makerWithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "u16"
          },
          {
            "name": "marketName",
            "type": "string"
          },
          {
            "name": "marketAssetMint",
            "type": "pubkey"
          },
          {
            "name": "reserveBefore",
            "type": "u64"
          },
          {
            "name": "reserveAfter",
            "type": "u64"
          },
          {
            "name": "premiumsBefore",
            "type": "u64"
          },
          {
            "name": "premiumsAfter",
            "type": "u64"
          },
          {
            "name": "lpTokensBefore",
            "type": "u64"
          },
          {
            "name": "lpTokensAfter",
            "type": "u64"
          },
          {
            "name": "tokensWithdrawn",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "assetMint",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "reserveSupply",
            "type": "u64"
          },
          {
            "name": "committedReserve",
            "type": "u64"
          },
          {
            "name": "premiums",
            "type": "u64"
          },
          {
            "name": "lpMinted",
            "type": "u64"
          },
          {
            "name": "priceFeed",
            "type": "string"
          },
          {
            "name": "assetDecimals",
            "type": "u8"
          },
          {
            "name": "hour1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "hour4VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day3VolatilityBps",
            "type": "u32"
          },
          {
            "name": "weekVolatilityBps",
            "type": "u32"
          },
          {
            "name": "volLastUpdated",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "optionBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "u16"
          },
          {
            "name": "optionIx",
            "type": "u8"
          },
          {
            "name": "option",
            "type": {
              "defined": {
                "name": "optionType"
              }
            }
          },
          {
            "name": "strikePriceUsd",
            "type": "u64"
          },
          {
            "name": "boughtAtPriceUsd",
            "type": "u64"
          },
          {
            "name": "maxPotentialPayoutInTokens",
            "type": "u64"
          },
          {
            "name": "expiryStamp",
            "type": "i64"
          },
          {
            "name": "quantity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "optionExercised",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "u16"
          },
          {
            "name": "optionIx",
            "type": "u8"
          },
          {
            "name": "option",
            "type": {
              "defined": {
                "name": "optionType"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "profitUsd",
            "type": "u64"
          },
          {
            "name": "userPayout",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "optionOrder",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "strikePrice",
            "type": "u64"
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "premium",
            "type": "u64"
          },
          {
            "name": "premiumInUsd",
            "type": "u64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "maxPotentialPayoutInTokens",
            "type": "u64"
          },
          {
            "name": "marketIx",
            "type": "u16"
          },
          {
            "name": "optionType",
            "type": "u8"
          },
          {
            "name": "ix",
            "type": "u8"
          },
          {
            "name": "isUsed",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "optionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "put"
          },
          {
            "name": "call"
          }
        ]
      }
    },
    {
      "name": "priceFeedMessage",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "docs": [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "price",
            "type": "i64"
          },
          {
            "name": "conf",
            "type": "u64"
          },
          {
            "name": "exponent",
            "type": "i32"
          },
          {
            "name": "publishTime",
            "docs": [
              "The timestamp of this price update in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "prevPublishTime",
            "docs": [
              "The timestamp of the previous price update. This field is intended to allow users to",
              "identify the single unique price update for any moment in time:",
              "for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.",
              "",
              "Note that there may not be such an update while we are migrating to the new message-sending logic,",
              "as some price updates on pythnet may not be sent to other chains (because the message-sending",
              "logic may not have triggered). We can solve this problem by making the message-sending mandatory",
              "(which we can do once publishers have migrated over).",
              "",
              "Additionally, this field may be equal to publish_time if the message is sent on a slot where",
              "where the aggregation was unsuccesful. This problem will go away once all publishers have",
              "migrated over to a recent version of pyth-agent."
            ],
            "type": "i64"
          },
          {
            "name": "emaPrice",
            "type": "i64"
          },
          {
            "name": "emaConf",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceUpdateV2",
      "docs": [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "writeAuthority",
            "type": "pubkey"
          },
          {
            "name": "verificationLevel",
            "type": {
              "defined": {
                "name": "verificationLevel"
              }
            }
          },
          {
            "name": "priceMessage",
            "type": {
              "defined": {
                "name": "priceFeedMessage"
              }
            }
          },
          {
            "name": "postedSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "spotDeviation",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "n20"
          },
          {
            "name": "n15"
          },
          {
            "name": "n10"
          },
          {
            "name": "n5"
          },
          {
            "name": "p0"
          },
          {
            "name": "p5"
          },
          {
            "name": "p10"
          },
          {
            "name": "p15"
          },
          {
            "name": "p20"
          }
        ]
      }
    },
    {
      "name": "updateMarketVolParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ix",
            "type": "u16"
          },
          {
            "name": "hour1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "hour4VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day1VolatilityBps",
            "type": "u32"
          },
          {
            "name": "day3VolatilityBps",
            "type": "u32"
          },
          {
            "name": "weekVolatilityBps",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "options",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "optionOrder"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "verificationLevel",
      "docs": [
        "Pyth price updates are bridged to all blockchains via Wormhole.",
        "Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.",
        "The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,",
        "so we also allow for partial verification.",
        "",
        "This enum represents how much a price update has been verified:",
        "- If `Full`, we have verified the signatures for two thirds of the current guardians.",
        "- If `Partial`, only `num_signatures` guardian signatures have been checked.",
        "",
        "# Warning",
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "partial",
            "fields": [
              {
                "name": "numSignatures",
                "type": "u8"
              }
            ]
          },
          {
            "name": "full"
          }
        ]
      }
    },
    {
      "name": "withdrawFeesParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ix",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "withdrawParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lpTokensToBurn",
            "type": "u64"
          },
          {
            "name": "minAmountOut",
            "type": "u64"
          },
          {
            "name": "ix",
            "type": "u16"
          }
        ]
      }
    }
  ]
};

import { base, mode } from 'viem/chains';

export const SEASON_2_START_DATE = '2024-5-15';
export const SEASON_2_BASE_START_DATE = '2024-5-20';

export type Multipliers = {
  eigenlayer?: boolean;
  etherfi?: number;
  ionic: number;
  kelp?: number;
  mode?: number;
  renzo?: number;
};

export const multipliers: Record<
  number,
  Record<
    string,
    Record<
      string,
      {
        borrow?: Multipliers;
        decimals?: number;
        market: string;
        multiplier?: number;
        supply: Multipliers;
      }
    >
  >
> = {
  [mode.id]: {
    // main market
    '0': {
      'M-BTC': {
        borrow: {
          ionic: 3,
          mode: 1
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      STONE: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        market: 'ststone_market',
        multiplier: 3000,
        supply: {
          ionic: 2,
          mode: 2
        }
      },
      USDC: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        decimals: 6,
        market: 'usdc_market',
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      USDT: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      WBTC: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      WETH: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        market: 'weth_market',
        multiplier: 3000,
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      ezETH: {
        borrow: undefined,
        market: 'ezeth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 2,
          mode: 2,
          renzo: 2
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          ionic: 3,
          mode: 1
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 3,
          ionic: 2,
          mode: 3
        }
      },
      wrsETH: {
        borrow: {
          eigenlayer: true,
          ionic: 3,
          kelp: 1,
          mode: 1
        },
        market: 'wrsteth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 2,
          kelp: 2,
          mode: 2
        }
      }
    },
    '1': {
      MODE: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          ionic: 3,
          mode: 3
        }
      },
      USDC: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      USDT: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          ionic: 1.5,
          mode: 2
        }
      },
      WETH: {
        borrow: {
          ionic: 3,
          mode: 1
        },
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
          ionic: 1.5,
          mode: 2
        }
      }
    }
  },
  [base.id]: {
    '0': {
      AERO: {
        borrow: {
          ionic: 3
        },
        market: 'base_ionaero',
        supply: {
          ionic: 3
        }
      },
      USDC: {
        borrow: {
          ionic: 3
        },
        market: 'base_ionusdc',
        supply: {
          ionic: 3
        }
      },
      WETH: {
        borrow: {
          ionic: 3
        },
        market: 'base_ionweth',
        multiplier: 3000,
        supply: {
          ionic: 3
        }
      },
      cbETH: {
        borrow: {
          ionic: 3
        },
        market: 'base_ioncbeth',
        multiplier: 3000,
        supply: {
          ionic: 3
        }
      },
      ezETH: {
        borrow: undefined,
        market: 'base_ionezeth',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 3,
          renzo: 2
        }
      },
      wstETH: {
        borrow: {
          ionic: 3
        },
        market: 'base_ionwsteth',
        multiplier: 3000,
        supply: {
          ionic: 3
        }
      }
    }
  }
};

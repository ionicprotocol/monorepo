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
  flywheel?: boolean;
  ionRewards?: boolean;
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
        market?: string;
        multiplier?: number;
        supply?: Multipliers;
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
          mode: 1,
          ionRewards: false
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      STONE: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        market: 'ststone_market',
        multiplier: 3000,
        supply: {
          ionic: 2,
          mode: 2,
          ionRewards: false
        }
      },
      USDC: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        decimals: 6,
        market: 'usdc_market',
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      USDT: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      WBTC: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      WETH: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        market: 'weth_market',
        multiplier: 3000,
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
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
          renzo: 2,
          ionRewards: false
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 2,
          ionic: 2,
          mode: 2,
          ionRewards: false
        }
      },
      wrsETH: {
        borrow: {
          eigenlayer: true,
          ionic: 3,
          kelp: 1,
          mode: 1,
          ionRewards: false
        },
        market: 'wrsteth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 2,
          kelp: 2,
          mode: 2,
          ionRewards: false
        }
      }
    },
    '1': {
      MODE: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          ionic: 3,
          mode: 3,
          ionRewards: false
        }
      },
      USDC: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      USDT: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      },
      WETH: {
        borrow: {
          ionic: 3,
          mode: 1,
          ionRewards: false
        },
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
          ionic: 1.5,
          mode: 2,
          ionRewards: false
        }
      }
    }
  },
  [base.id]: {
    '0': {
      eUSD: {
        borrow: { flywheel: true, ionic: 0, ionRewards: true },
        supply: { flywheel: true, ionic: 0, ionRewards: false }
      },
      bsdETH: {
        borrow: { flywheel: true, ionic: 0, ionRewards: true },
        supply: { flywheel: true, ionic: 0, ionRewards: true }
      },
      hyUSD: {
        supply: { flywheel: true, ionic: 0, ionRewards: true }
      },
      AERO: {
        borrow: {
          ionic: 3,
          ionRewards: false
        },
        market: 'ionaero_base',
        multiplier: 1.15,
        supply: {
          ionic: 3,
          ionRewards: false
        }
      },
      USDC: {
        borrow: {
          ionic: 3,
          ionRewards: false
        },
        market: 'ionusdc_base',
        supply: {
          ionic: 3,
          ionRewards: false
        }
      },
      WETH: {
        borrow: {
          ionic: 3,
          ionRewards: false
        },
        market: 'ionweth_base',
        multiplier: 3000,
        supply: {
          ionic: 3,
          ionRewards: false
        }
      },
      cbETH: {
        borrow: {
          ionic: 3,
          ionRewards: false
        },
        market: 'ioncbeth_base',
        multiplier: 3000,
        supply: {
          ionic: 3,
          ionRewards: false
        }
      },
      ezETH: {
        borrow: undefined,
        market: 'ionezeth_base',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 3,
          renzo: 2,
          ionRewards: false
        }
      },
      wstETH: {
        borrow: {
          ionic: 3,
          ionRewards: false
        },
        market: 'ionwsteth_base',
        multiplier: 3000,
        supply: {
          ionic: 3,
          ionRewards: false
        }
      }
    }
  }
};

export type LpMultipliers = {
  ionMultiplier: number;
  market: string;
  priceMultiplier: number;
  filterIn?: string;
  filterOut?: string;
  decimals?: number;
};

export const ionLPMultipliers: Record<string, LpMultipliers> = {
  'ION-WETH': {
    ionMultiplier: 3,
    market: 'ion_weth_pool',
    priceMultiplier: -120,
    filterIn: "AND event_to='0x3f385fedd141f57323dd91aa735c7243382831d8'",
    filterOut: "AND event_from='0x3f385fedd141f57323dd91aa735c7243382831d8'"
  }
};

export const steerLPMultipliers: Record<string, LpMultipliers> = {
  'ionUSDC-ionUSDT': {
    ionMultiplier: 1.5,
    market: 'iusdc_iusdt_pool',
    priceMultiplier: 10,
    decimals: 6
  }
};

import { base, bob, fraxtal, mode, optimism } from 'viem/chains';

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
  ionAPR?: boolean;
  turtle?: boolean;
  rewards?: boolean;
  spice?: boolean;
  underlyingAPR?: number;
  nektar?: number;
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
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      dMBTC: {
        borrow: {
          rewards: true,
          ionAPR: false,
          turtle: true,
          ionic: 0,
          mode: 1
        },
        market: 'dmBTC_market',
        supply: {
          ionic: 0,
          mode: 2,
          underlyingAPR: 10,
          rewards: true,
          turtle: true,
          ionAPR: false,
          flywheel: false
        }
      },
      STONE: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        market: 'ststone_market',
        multiplier: 3000,
        supply: {
          ionic: 0,
          underlyingAPR: 2.94,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      USDC: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        decimals: 6,
        market: 'usdc_market',
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      USDT: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      WBTC: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      WETH: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          flywheel: false
        },
        market: 'weth_market',
        multiplier: 3000,
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      ezETH: {
        borrow: { turtle: false, rewards: true, ionAPR: false, ionic: 0 },
        market: 'ezeth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 0,
          mode: 2,
          renzo: 2,
          underlyingAPR: 3.25,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      sUSDe: {
        borrow: {
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          ionic: 0
        },
        multiplier: 0,
        supply: {
          ionic: 0,
          mode: 2,
          underlyingAPR: 4.5,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      USDe: {
        borrow: {
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          ionic: 0
        },
        multiplier: 0,
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      msDAI: {
        borrow: {
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          ionic: 0
        },
        multiplier: 0,
        supply: {
          ionic: 0,
          mode: 2,
          underlyingAPR: 6,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          flywheel: false
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 3,
          ionic: 0,
          mode: 2,
          underlyingAPR: 2.99,
          turtle: true,
          rewards: true,
          ionAPR: false,
          flywheel: false
        }
      },
      wrsETH: {
        borrow: {
          eigenlayer: true,
          ionic: 0,
          kelp: 1,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        market: 'wrsteth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 0,
          kelp: 2,
          mode: 2,
          underlyingAPR: 3.63,
          turtle: true,
          rewards: true,
          ionAPR: false
        }
      }
    },
    '1': {
      MODE: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          ionic: 0,
          mode: 3,
          turtle: true,
          rewards: true,
          ionAPR: false,
          flywheel: false
        }
      },
      USDC: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false,
          flywheel: false
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      WETH: {
        borrow: {
          ionic: 0,
          mode: 1,
          turtle: true,
          rewards: true,
          ionAPR: false
        },
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
          ionic: 0,
          mode: 2,
          turtle: true,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      }
    }
  },
  [base.id]: {
    '0': {
      eUSD: {
        borrow: {
          flywheel: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true
        },
        supply: {
          flywheel: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      bsdETH: {
        borrow: {
          flywheel: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true
        },
        supply: {
          flywheel: true,
          ionic: 0,
          nektar: 1,
          underlyingAPR: 2.6,
          turtle: false,
          rewards: true,
          ionAPR: true
        }
      },
      hyUSD: {
        supply: {
          flywheel: true,
          ionic: 0,
          underlyingAPR: 3.5,
          turtle: false,
          rewards: true,
          ionAPR: false
        },
        borrow: {
          flywheel: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true
        }
      },
      AERO: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        },
        market: 'ionaero_base',
        multiplier: 1.15,
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      USDC: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        market: 'ionusdc_base',
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        decimals: 6
      },
      WETH: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        market: 'ionweth_base',
        multiplier: 3000,
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      cbETH: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        },
        market: 'ioncbeth_base',
        multiplier: 3000,
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      ezETH: {
        market: 'ionezeth_base',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          ionic: 0,
          renzo: 2,
          underlyingAPR: 3.25,
          turtle: false,
          rewards: true,
          ionAPR: false
        },
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          ionic: 0
        }
      },
      'weETH.mode': {
        borrow: { turtle: false, rewards: true, ionAPR: false, ionic: 0 },
        supply: {
          ionic: 0,
          etherfi: 3,
          underlyingAPR: 2.99,
          turtle: false,
          rewards: true,
          ionAPR: false,
          flywheel: false
        }
      },
      RSR: {
        borrow: {
          turtle: false,
          rewards: false,
          ionAPR: false,
          ionic: 0,
          flywheel: false
        },
        supply: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false,
          flywheel: false
        }
      },
      wstETH: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        market: 'ionwsteth_base',
        multiplier: 3000,
        supply: {
          ionic: 0,
          underlyingAPR: 2.9,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      wsuperOETHb: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        supply: {
          ionic: 0,
          underlyingAPR: 15,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      wUSDM: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionic: 0,
          underlyingAPR: 5,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      'USD+': {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        supply: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false,
          flywheel: false
        }
      },
      'wUSD+': {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        supply: {
          ionic: 0,
          underlyingAPR: 10,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      USDz: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false,
          flywheel: false
        },
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false,
          flywheel: false
        }
      },
      EURC: {
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      cbBTC: {
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      }
    }
  },
  [bob.id]: {
    '0': {
      USDC: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      USDT: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      WETH: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      WBTC: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      tBTC: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      SOV: {
        borrow: {
          turtle: false,
          rewards: true,
          ionAPR: false,
          spice: true,
          ionic: 0
        },
        supply: {
          spice: true,
          ionic: 0,
          rewards: true,
          turtle: false,
          ionAPR: false
        }
      }
    }
  },
  [optimism.id]: {
    '0': {
      USDC: {
        supply: {
          ionic: 0,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      },
      wstETH: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        supply: {
          ionic: 0,
          underlyingAPR: 2.9,
          turtle: false,
          rewards: true,
          ionAPR: false
        }
      },
      wUSDM: {
        supply: {
          ionic: 0,
          underlyingAPR: 5,
          turtle: false,
          rewards: true,
          ionAPR: true,
          flywheel: true
        }
      }
    }
  },
  [fraxtal.id]: {
    '0': {
      wfrxETH: {
        borrow: {
          ionic: 0,
          turtle: false,
          rewards: false,
          ionAPR: false
        },
        supply: {
          ionic: 0,
          underlyingAPR: 3.46,
          turtle: false,
          rewards: true,
          ionAPR: false
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

export const ionLPMultipliersMode: LpMultipliers = {
  ionMultiplier: 3,
  market: 'ion_weth_pool',
  priceMultiplier: -120,
  filterIn: "AND event_to='0x3f385fedd141f57323dd91aa735c7243382831d8'",
  filterOut: "AND event_from='0x3f385fedd141f57323dd91aa735c7243382831d8'"
};

export const ionLPMultipliersBase: LpMultipliers = {
  ionMultiplier: 3,
  market: 'ion_weth_pool_base',
  priceMultiplier: -120,
  filterIn: "AND event_to='0x9b42e5f8c45222b2715f804968251c747c588fd7'",
  filterOut: "AND event_from='0x9b42e5f8c45222b2715f804968251c747c588fd7'"
};

export const steerLPMultipliers: Record<string, LpMultipliers> = {
  'ionUSDC-ionUSDT': {
    ionMultiplier: 1.5,
    market: 'iusdc_iusdt_pool',
    priceMultiplier: 10,
    decimals: 6
  }
};

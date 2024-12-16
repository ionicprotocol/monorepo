import { base, bob, fraxtal, lisk, mode, optimism } from 'viem/chains';

export type Multipliers = {
  eigenlayer?: boolean;
  etherfi?: number;
  kelp?: number;
  renzo?: number;
  flywheel?: boolean;
  ionAPR?: boolean;
  turtle?: boolean;
  spice?: boolean;
  underlyingAPR?: number;
  op?: boolean;
  lsk?: boolean;
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
    '0': {
      'M-BTC': {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          op: true
        }
      },
      dMBTC: {
        borrow: {
          ionAPR: false,
          turtle: false
        },
        market: 'dmBTC_market',
        supply: {
          underlyingAPR: 10,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      STONE: {
        borrow: {
          turtle: true,
          ionAPR: false
        },
        market: 'ststone_market',
        multiplier: 3000,
        supply: {
          underlyingAPR: 2.94,
          turtle: true,
          ionAPR: false
        }
      },
      USDC: {
        borrow: {
          ionAPR: true,
          flywheel: true,
          op: true
        },
        decimals: 6,
        market: 'usdc_market',
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      WBTC: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      WETH: {
        borrow: {
          ionAPR: true,
          flywheel: true,
          op: true
        },
        market: 'weth_market',
        multiplier: 3000,
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      ezETH: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        market: 'ezeth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          renzo: 2,
          underlyingAPR: 3.25,
          ionAPR: false,
          flywheel: false
        }
      },
      sUSDe: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          underlyingAPR: 4.5,
          turtle: false,
          ionAPR: false
        }
      },
      USDe: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          turtle: false,
          ionAPR: false
        }
      },
      msDAI: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          underlyingAPR: 6,
          turtle: false,
          ionAPR: false
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 3,
          underlyingAPR: 2.99,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      wrsETH: {
        borrow: {
          eigenlayer: true,
          kelp: 1,
          turtle: true,
          ionAPR: false
        },
        market: 'wrsteth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          kelp: 2,
          underlyingAPR: 3.63,
          turtle: true,
          ionAPR: false,
          flywheel: false
        }
      }
    },
    1: {
      MODE: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false,
          op: true
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        }
      },
      USDC: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      WETH: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
          turtle: false,
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
          turtle: false,
          ionAPR: true
        },
        supply: {
          flywheel: true,
          turtle: false,
          ionAPR: false
        }
      },
      bsdETH: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          underlyingAPR: 2.6,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      hyUSD: {
        supply: {
          underlyingAPR: 3.5,
          turtle: false,
          ionAPR: false,
          flywheel: true
        },
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      AERO: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        market: 'ionaero_base',
        multiplier: 1.15,
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      USDC: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        market: 'ionusdc_base',
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        decimals: 6
      },
      WETH: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        market: 'ionweth_base',
        multiplier: 3000,
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      cbETH: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        market: 'ioncbeth_base',
        multiplier: 3000,
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      ezETH: {
        market: 'ionezeth_base',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          renzo: 2,
          underlyingAPR: 3.25,
          turtle: true,
          ionAPR: false
        },
        borrow: {
          turtle: false,
          ionAPR: false
        }
      },
      weETH: {
        borrow: {
          etherfi: 1,
          turtle: false,
          ionAPR: false,
          eigenlayer: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      RSR: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      wstETH: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        market: 'ionwsteth_base',
        multiplier: 3000,
        supply: {
          underlyingAPR: 2.9,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      wsuperOETHb: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        supply: {
          underlyingAPR: 15,
          turtle: false,
          ionAPR: false
        }
      },
      wUSDM: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          underlyingAPR: 5,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      'USD+': {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        supply: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        }
      },
      'wUSD+': {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        supply: {
          underlyingAPR: 10,
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      USDz: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        }
      },
      EURC: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      cbBTC: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      uSOL: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      uSUI: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      sUSDz: {
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          underlyingAPR: 15
        }
      },
      fBOMB: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      KLIMA: {
        borrow: {
          turtle: false,
          ionAPR: false,
          flywheel: false
        },
        supply: {
          turtle: false,
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
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      },
      USDT: {
        borrow: {
          turtle: false,
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      },
      WETH: {
        borrow: {
          turtle: false,
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      },
      WBTC: {
        borrow: {
          turtle: false,
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      },
      tBTC: {
        borrow: {
          turtle: false,
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      },
      SOV: {
        borrow: {
          turtle: false,
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          turtle: false,
          ionAPR: false
        }
      }
    }
  },
  [optimism.id]: {
    '0': {
      WETH: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      USDC: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      wstETH: {
        borrow: {
          turtle: false,
          ionAPR: false
        },
        supply: {
          underlyingAPR: 2.9,
          turtle: false,
          ionAPR: false
        }
      },
      wUSDM: {
        supply: {
          underlyingAPR: 5,
          turtle: false,
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      SNX: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      weETH: {
        borrow: {
          etherfi: 1,
          turtle: false,
          ionAPR: true,
          eigenlayer: true,
          flywheel: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
          turtle: false,
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
          turtle: false,
          ionAPR: false
        },
        supply: {
          underlyingAPR: 3.46,
          turtle: false,
          ionAPR: false
        }
      },
      FRAX: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      },
      sfrxETH: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
        }
      }
    }
  },
  [lisk.id]: {
    '0': {
      WETH: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      USDC: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      USDT: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      WBTC: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      LSK: {
        supply: {
          turtle: false,
          ionAPR: true,
          flywheel: true
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

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
  fxtl?: number;
  totems?: number;
  inceptionTurtle?: boolean;
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
          ionAPR: false,
          op: true
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
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
          flywheel: true
        }
      },
      uniBTC: {
        supply: {
          op: true
        }
      },
      oBTC: {
        supply: {
          op: true
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
        supply: {}
      },
      USDT: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      WBTC: {
        borrow: {
          ionAPR: false
        },
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
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
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          underlyingAPR: 4.5,
          ionAPR: false
        }
      },
      USDe: {
        borrow: {
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          ionAPR: false
        }
      },
      msDAI: {
        borrow: {
          ionAPR: false
        },
        multiplier: 0,
        supply: {
          underlyingAPR: 6,
          ionAPR: false
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          ionAPR: true,
          flywheel: true
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 3,
          underlyingAPR: 2.99,
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
          ionAPR: false,
          flywheel: false,
          op: true
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          ionAPR: false,
          flywheel: false
        }
      },
      USDC: {
        borrow: {
          ionAPR: false
        },
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      WETH: {
        borrow: {
          ionAPR: false
        },
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
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
          ionAPR: true
        },
        supply: {
          flywheel: true,
          ionAPR: true
        }
      },
      bsdETH: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          underlyingAPR: 2.6,
          ionAPR: true,
          flywheel: true
        }
      },
      hyUSD: {
        supply: {
          underlyingAPR: 3.5,
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          ionAPR: true,
          flywheel: true
        }
      },
      AERO: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        market: 'ionaero_base',
        multiplier: 1.15,
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      USDC: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        market: 'ionusdc_base',
        supply: {
          flywheel: true
        },
        decimals: 6
      },
      WETH: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        market: 'ionweth_base',
        multiplier: 3000,
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      cbETH: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        market: 'ioncbeth_base',
        multiplier: 3000,
        supply: {
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
          ionAPR: false
        }
      },
      weETH: {
        borrow: {
          etherfi: 1,
          ionAPR: false,
          eigenlayer: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
          ionAPR: true,
          flywheel: true
        }
      },
      RSR: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      wstETH: {
        borrow: {
          ionAPR: false
        },
        market: 'ionwsteth_base',
        multiplier: 3000,
        supply: {
          underlyingAPR: 2.9,
          ionAPR: true,
          flywheel: true
        }
      },
      wsuperOETHb: {
        borrow: {
          ionAPR: false
        },
        supply: {
          underlyingAPR: 15,
          ionAPR: false
        }
      },
      wUSDM: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          underlyingAPR: 5,
          ionAPR: true,
          flywheel: true
        }
      },
      'USD+': {
        borrow: {
          ionAPR: false
        },
        supply: {
          ionAPR: false,
          flywheel: false
        }
      },
      'wUSD+': {
        borrow: {
          ionAPR: false
        },
        supply: {
          underlyingAPR: 10,
          ionAPR: true,
          flywheel: true
        }
      },
      USDz: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: false,
          flywheel: false
        }
      },
      EURC: {
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      cbBTC: {
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      uSOL: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      uSUI: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      sUSDz: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: true,
          flywheel: true,
          underlyingAPR: 15
        }
      },
      fBOMB: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      KLIMA: {
        borrow: {
          ionAPR: false,
          flywheel: false
        },
        supply: {
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
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      },
      USDT: {
        borrow: {
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      },
      WETH: {
        borrow: {
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      },
      WBTC: {
        borrow: {
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      },
      tBTC: {
        borrow: {
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      },
      SOV: {
        borrow: {
          ionAPR: false,
          spice: true
        },
        supply: {
          spice: true,
          ionAPR: false
        }
      }
    }
  },
  [optimism.id]: {
    '0': {
      WETH: {
        supply: {
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          ionAPR: true,
          flywheel: true
        }
      },
      USDC: {
        supply: {
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          ionAPR: true,
          flywheel: true
        }
      },
      wstETH: {
        borrow: {
          ionAPR: false
        },
        supply: {
          underlyingAPR: 2.9,
          ionAPR: false
        }
      },
      wUSDM: {
        supply: {
          underlyingAPR: 5,
          ionAPR: true,
          flywheel: true
        },
        borrow: {
          ionAPR: true,
          flywheel: true
        }
      },
      SNX: {
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      weETH: {
        borrow: {
          etherfi: 1,
          ionAPR: true,
          eigenlayer: true,
          flywheel: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
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
          ionAPR: false
        },
        supply: {
          underlyingAPR: 3.46,
          ionAPR: true,
          flywheel: true,
          fxtl: 2.5
        }
      },
      FRAX: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: true,
          flywheel: true,
          fxtl: 2.5
        }
      },
      sfrxETH: {
        borrow: {
          ionAPR: true,
          flywheel: true
        },
        supply: {
          ionAPR: true,
          flywheel: true
        }
      },
      FXS: {
        supply: {
          ionAPR: true,
          flywheel: true,
          fxtl: 12.5
        }
      },
      insfrxETH: {
        supply: {
          ionAPR: true,
          flywheel: true,
          totems: 3,
          inceptionTurtle: true
        }
      },
      sFRAX: {
        supply: {
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
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      USDC: {
        supply: {
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      USDT: {
        supply: {
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      WBTC: {
        supply: {
          ionAPR: true,
          flywheel: true,
          lsk: true
        }
      },
      LSK: {
        supply: {
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

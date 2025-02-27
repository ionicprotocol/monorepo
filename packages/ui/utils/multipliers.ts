import { base, bob, fraxtal, lisk, mode, optimism } from 'viem/chains';

export type Multipliers = {
  eigenlayer?: boolean;
  etherfi?: number;
  kelp?: number;
  renzo?: number;
  flywheel?: boolean;
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
          op: true
        },
        market: 'm_btc_market',
        multiplier: 66000,
        supply: {
          flywheel: true,
          op: true
        }
      },
      dMBTC: {
        borrow: {
          turtle: false
        },
        market: 'dmBTC_market',
        supply: {
          underlyingAPR: 10,
          flywheel: false
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
          turtle: true
        },
        market: 'ststone_market',
        multiplier: 3000,
        supply: {
          underlyingAPR: 2.94,
          turtle: true
        }
      },
      USDC: {
        borrow: {
          flywheel: false,
          op: true
        },
        decimals: 6,
        market: 'usdc_market',
        supply: {
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          flywheel: false
        },
        decimals: 6,
        market: 'usdt_market',
        supply: {
          flywheel: false
        }
      },
      WBTC: {
        borrow: {},
        decimals: 8,
        market: 'wbtc_market',
        multiplier: 66000,
        supply: {
          flywheel: false
        }
      },
      WETH: {
        borrow: {
          flywheel: true,
          op: true
        },
        market: 'weth_market',
        multiplier: 3000,
        supply: {
          flywheel: true
        }
      },
      ezETH: {
        borrow: {},
        market: 'ezeth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          renzo: 2,
          underlyingAPR: 3.25,
          flywheel: false
        }
      },
      sUSDe: {
        borrow: {},
        multiplier: 0,
        supply: {
          underlyingAPR: 4.5
        }
      },
      USDe: {
        borrow: {},
        multiplier: 0,
        supply: {}
      },
      msDAI: {
        borrow: {},
        multiplier: 0,
        supply: {
          underlyingAPR: 6
        }
      },
      'weETH.mode': {
        borrow: {
          eigenlayer: true,
          etherfi: 1,
          flywheel: false
        },
        market: 'weeth_market_new',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          etherfi: 3,
          underlyingAPR: 2.99,
          flywheel: true
        }
      },
      wrsETH: {
        borrow: {
          eigenlayer: true,
          kelp: 1,
          turtle: true
        },
        market: 'wrsteth_market',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          kelp: 2,
          underlyingAPR: 3.63,
          turtle: true,
          flywheel: false
        }
      }
    },
    1: {
      MODE: {
        borrow: {
          flywheel: false,
          op: true
        },
        market: 'ionmode_modenative',
        multiplier: 0.035,
        supply: {
          flywheel: true
        }
      },
      USDC: {
        borrow: {},
        decimals: 6,
        market: 'ionusdc_modenative',
        supply: {
          flywheel: true
        }
      },
      USDT: {
        borrow: {
          flywheel: false
        },
        decimals: 6,
        market: 'ionusdt_modenative',
        supply: {
          flywheel: true
        }
      },
      WETH: {
        borrow: {},
        market: 'ionweth_modenative',
        multiplier: 3000,
        supply: {
          flywheel: true
        }
      }
    }
  },
  [base.id]: {
    '0': {
      eUSD: {
        borrow: {
          flywheel: true
        },
        supply: {
          flywheel: true
        }
      },
      bsdETH: {
        borrow: {
          flywheel: true
        },
        supply: {
          underlyingAPR: 2.6,
          flywheel: true
        }
      },
      hyUSD: {
        supply: {
          underlyingAPR: 3.5,
          flywheel: true
        },
        borrow: {
          flywheel: true
        }
      },
      AERO: {
        borrow: {
          flywheel: false
        },
        market: 'ionaero_base',
        multiplier: 1.15,
        supply: {
          flywheel: false
        }
      },
      USDC: {
        borrow: {
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
          flywheel: false
        },
        market: 'ionweth_base',
        multiplier: 3000,
        supply: {
          flywheel: true
        }
      },
      cbETH: {
        borrow: {
          flywheel: false
        },
        market: 'ioncbeth_base',
        multiplier: 3000,
        supply: {
          flywheel: false
        }
      },
      ezETH: {
        market: 'ionezeth_base',
        multiplier: 3000,
        supply: {
          eigenlayer: true,
          renzo: 2,
          underlyingAPR: 3.25,
          turtle: true
        },
        borrow: {}
      },
      weETH: {
        borrow: {
          etherfi: 1,
          eigenlayer: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
          flywheel: true
        }
      },
      RSR: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: false
        }
      },
      wstETH: {
        borrow: {},
        market: 'ionwsteth_base',
        multiplier: 3000,
        supply: {
          underlyingAPR: 2.9,
          flywheel: false
        }
      },
      wsuperOETHb: {
        borrow: {},
        supply: {
          underlyingAPR: 15,
          flywheel: false
        }
      },
      wUSDM: {
        borrow: {
          flywheel: false
        },
        supply: {
          underlyingAPR: 5,
          flywheel: false
        }
      },
      'USD+': {
        borrow: {},
        supply: {
          flywheel: false
        }
      },
      'wUSD+': {
        borrow: {},
        supply: {
          underlyingAPR: 10,
          flywheel: false
        }
      },
      USDz: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: false
        }
      },
      EURC: {
        supply: {
          flywheel: false
        }
      },
      cbBTC: {
        supply: {
          flywheel: false
        }
      },
      uSOL: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: true
        }
      },
      uSUI: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: true
        }
      },
      sUSDz: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: false,
          underlyingAPR: 15
        }
      },
      fBOMB: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: false
        }
      },
      KLIMA: {
        borrow: {
          flywheel: false
        },
        supply: {
          flywheel: true
        }
      }
    }
  },
  [bob.id]: {
    '0': {
      USDC: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      },
      USDT: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      },
      WETH: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      },
      WBTC: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      },
      tBTC: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      },
      SOV: {
        borrow: {
          spice: true
        },
        supply: {
          spice: true
        }
      }
    }
  },
  [optimism.id]: {
    '0': {
      WETH: {
        supply: {
          flywheel: true
        },
        borrow: {
          flywheel: true
        }
      },
      USDC: {
        supply: {
          flywheel: true
        },
        borrow: {
          flywheel: true
        }
      },
      wstETH: {
        borrow: {},
        supply: {
          underlyingAPR: 2.9
        }
      },
      wUSDM: {
        supply: {
          underlyingAPR: 5,
          flywheel: true
        },
        borrow: {
          flywheel: true
        }
      },
      SNX: {
        supply: {
          flywheel: true
        }
      },
      weETH: {
        borrow: {
          etherfi: 1,
          eigenlayer: true,
          flywheel: true
        },
        supply: {
          etherfi: 3,
          underlyingAPR: 2.99,
          eigenlayer: true,
          flywheel: true
        }
      }
    }
  },
  [fraxtal.id]: {
    '0': {
      wfrxETH: {
        borrow: {},
        supply: {
          underlyingAPR: 3.46,
          flywheel: true,
          fxtl: 2.5
        }
      },
      FRAX: {
        borrow: {
          flywheel: true
        },
        supply: {
          flywheel: true,
          fxtl: 2.5
        }
      },
      sfrxETH: {
        borrow: {
          flywheel: true
        },
        supply: {
          flywheel: true
        }
      },
      FXS: {
        supply: {
          flywheel: true,
          fxtl: 12.5
        }
      },
      insfrxETH: {
        supply: {
          flywheel: true,
          totems: 3,
          inceptionTurtle: true
        }
      },
      sFRAX: {
        supply: {
          flywheel: true
        }
      }
    }
  },
  [lisk.id]: {
    '0': {
      WETH: {
        supply: {
          flywheel: true,
          lsk: true
        }
      },
      USDC: {
        supply: {
          flywheel: true,
          lsk: true
        }
      },
      USDT: {
        supply: {
          flywheel: true,
          lsk: true
        }
      },
      WBTC: {
        supply: {
          flywheel: true,
          lsk: true
        }
      },
      LSK: {
        supply: {
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

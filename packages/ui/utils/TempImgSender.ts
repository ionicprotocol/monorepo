// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendIMG(pool: string, chain: any, assetName: string): string {
  if (pool === '0' && chain === '34443') {
    return `/img/symbols/32/color/${assetName.toLowerCase()}.png`;
  }
  if (pool === '1' && chain === '34443') {
    const url =
      assetName.toLowerCase() === 'ezeth' ||
      assetName.toLowerCase() === 'usdc' ||
      assetName.toLowerCase() === 'weth'
        ? `/img/symbols/32/color/${assetName.toLowerCase()}(afteropfest).png`
        : `/img/symbols/32/color/${assetName.toLowerCase()}.png`;
    return url;
  }
  if (pool === '0' && chain !== '34443') {
    return assetName.toLowerCase() === 'ezeth' ||
      assetName.toLowerCase() === 'usdc' ||
      assetName.toLowerCase() === 'weth'
      ? `/img/symbols/32/color/${assetName.toLowerCase()}(afteropfest).png`
      : `/img/symbols/32/color/${assetName.toLowerCase()}.png`;
  }
  return `/img/symbols/32/color/${assetName.toLowerCase()}.png`;
}

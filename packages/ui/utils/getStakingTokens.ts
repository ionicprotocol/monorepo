export function getToken(chain: number): `0x${string}` {
  if (chain === 34443) return '0x18470019bf0e94611f15852f7e93cf5d65bc34ca';
  if (chain === 8453) return '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5';
  return '0x0000000000000000000000000000000000000000';
}

export function shortAddress(address: string) {
  return address.substring(0, 4) + '...' + address.substring(address.length - 2, address.length);
}

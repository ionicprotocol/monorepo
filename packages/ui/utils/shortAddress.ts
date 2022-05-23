export function shortAddress(address: string, front = 6, end = 4) {
  return (
    address.substring(0, front) + '...' + address.substring(address.length - end, address.length)
  );
}

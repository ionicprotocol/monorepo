export function shortAddress(address: string, front: number, end: number) {
  return (
    address.substring(0, front) + '...' + address.substring(address.length - end, address.length)
  );
}

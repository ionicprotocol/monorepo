export const toFixedNoRound = (value: number, len: number) => {
  let resultStr = '';
  if (Math.abs(value) < 1.0) {
    const e = parseInt(value.toString().split('e-')[1]);
    if (e) {
      if (e > len) {
        resultStr = '0';
      } else {
        const val = value * Math.pow(10, e - 1);
        resultStr = '0.' + new Array(e).join('0') + val.toString().substring(2, 3 + len - e);
      }
    } else {
      const value1 = value.toString().split('.')[0];
      const value2 = value.toString().split('.')[1];
      resultStr = value1 + '.' + value2 ? value2.slice(0, len) : '0';
    }
  } else {
    let e = parseInt(value.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      const val = value / Math.pow(10, e);
      resultStr = val + new Array(e + 1).join('0');
    }
  }

  return resultStr;
};

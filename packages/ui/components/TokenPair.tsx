import Image from 'next/image';

const TokenPair = ({
  token1,
  token2,
  size = 32
}: {
  token1: string;
  token2: string;
  size?: number;
}) => (
  <span className="flex">
    <Image
      src={`/img/logo/${token1.toLowerCase()}.svg`}
      alt={`${token1} logo`}
      width={size}
      height={size}
      className="rounded-full"
    />
    <Image
      src={`/img/logo/${token2.toUpperCase()}.png`}
      alt={`${token2} logo`}
      width={size}
      height={size}
      className="rounded-full -ml-2"
    />
  </span>
);

export default TokenPair;

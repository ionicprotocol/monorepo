import Image from 'next/image';

const TokenDisplay = ({
  tokens,
  tokenName,
  size = 18
}: {
  tokens: string[];
  tokenName?: string;
  size?: number;
}) => (
  <div className="flex items-center">
    <div className="relative flex items-center">
      {tokens.map((token, index) => (
        <div
          key={token}
          className="relative"
          style={{
            marginLeft: index > 0 ? '-0.5rem' : '0',
            zIndex: tokens.length - index
          }}
        >
          <Image
            src={`/img/symbols/32/color/${token.toLowerCase()}.png`}
            alt={`${token} logo`}
            width={size}
            height={size}
            className="rounded-full"
            style={{ minWidth: size, minHeight: size }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/img/logo/ION.png';
            }}
          />
        </div>
      ))}
    </div>
    <span className="ml-2">{tokenName?.toUpperCase()}</span>
  </div>
);

export default TokenDisplay;

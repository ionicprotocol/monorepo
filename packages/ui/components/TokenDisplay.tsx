import Image from 'next/image';

const TokenDisplay = ({
  tokens,
  tokenName
}: {
  tokens: string[];
  tokenName?: string;
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
            width={18}
            height={18}
            className="rounded-full border border-black bg-black"
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

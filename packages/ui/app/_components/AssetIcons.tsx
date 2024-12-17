import Image from 'next/image';

type RewardIconsProps = {
  rewards: string[];
  size?: number;
};

const iconMap = {
  op: '/images/op-logo-red.svg',
  turtle: '/images/turtle-ionic.png',
  stone: '/img/symbols/32/color/stone.png',
  etherfi: '/images/etherfi.png',
  kelp: '/images/kelpmiles.png',
  eigen: '/images/eigen.png',
  spice: '/img/symbols/32/color/bob.png',
  lsk: '/img/symbols/32/color/lsk.png'
};

export const AssetIcons = ({ rewards, size = 16 }: RewardIconsProps) => {
  const getIconPath = (reward: string) => {
    if (reward in iconMap) {
      return iconMap[reward as keyof typeof iconMap];
    }
    return `/img/symbols/32/color/${reward.toLowerCase()}.png`;
  };

  return (
    <div className="flex items-center">
      {rewards.map((reward, index) => (
        <div
          key={`${reward}-${index}`}
          className="rounded-full white"
          style={{
            marginLeft: index !== 0 ? '-6px' : '0',
            zIndex: rewards.length - index // Higher z-index for earlier icons
          }}
        >
          <div className="flex items-center justify-center">
            <Image
              src={getIconPath(reward)}
              alt={reward}
              width={size}
              height={size}
              className="rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

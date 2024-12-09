import Image from 'next/image';

type RewardIconsProps = {
  rewards: string[]; // Array of reward types like 'op', 'ionic', 'turtle', 'kelp', etc.
};

const iconMap = {
  op: '/images/op-logo-red.svg',
  ionic: '/img/ionic-sq.png',
  turtle: '/images/turtle-ionic.png',
  stone: '/img/symbols/32/color/stone.png',
  etherfi: '/images/etherfi.png',
  kelp: '/images/kelpmiles.png',
  eigen: '/images/eigen.png',
  spice: '/img/symbols/32/color/bob.png',
  anzen: '/img/symbols/32/color/usdz.png',
  nektar: '/img/symbols/32/color/nektar.png'
};

export const RewardIcons = ({ rewards }: RewardIconsProps) => {
  return (
    <div className="flex items-center">
      {rewards.map((reward, index) => (
        <div
          key={reward}
          className="rounded-full bg-black"
          style={{
            marginLeft: index !== 0 ? '-6px' : '0',
            zIndex: rewards.length - index // Higher z-index for earlier icons
          }}
        >
          <div className="size-4 flex items-center justify-center">
            <Image
              src={iconMap[reward as keyof typeof iconMap]}
              alt={reward}
              width={16}
              height={16}
              className="rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

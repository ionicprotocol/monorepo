/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useChainId } from 'wagmi';

import InfoPopover from '../../_components/veion/InfoPopover';

import { lockedData, lockedDataWithDelegate } from '@ui/constants/mock';
import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import Toggle from '@ui/app/_components/Toggle';
import MyveionRows from '@ui/app/_components/veion/MyveionRows';
import UndelegateVeionRows from '@ui/app/_components/veion/UndelegateVeionRows';

export default function Governance() {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const querywatch = searchParams.get('watch');
  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const chain = querychain ?? chainId;
  const watch = querywatch ?? 'overview';
  const view = queryview ?? 'MyVeion';
  const router = useRouter();
  // const [viewType, setViewType] = useState<string>('')
  // console.log(watch);
  return (
    <div className="w-full flex flex-col items-start py-4 gap-y-2 justify-start h-min bg-darkone ">
      <div className="flex flex-col items-start justify-start w-full h-min rounded-md bg-grayone px-6 py-4 ">
        <div className={`flex items-center justify-between w-full`}>
          <span className={`w-full font-semibold text-lg`}>
            {watch === 'overview' ? 'veION Overview' : 'My VeION'}
          </span>
          <div className={`flex self-end`}>
            <NetworkSelector
              nopool={true}
              dropdownSelectedChain={+chain}
            />
          </div>
        </div>
        <div className="flex  gap-x-3">
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-white/60 text-xs">
              Ion Wallet Balance{' '}
              <InfoPopover content="This is the amount of ION you have in your wallet." />
            </div>
            <div className="text-white/60 text-xs flex items-center">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block`}
                src="/img/symbols/32/color/ion.png"
              />
              <span className="text-white text-sm ">
                {watch === 'overview' ? '78942387' : '6376'} ION
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-white/60 text-xs">
              Total veION{' '}
              <InfoPopover content="This is the amount of veION you have in your wallet." />
            </div>
            <div className="text-white/60 text-xs flex items-center">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block`}
                src="/img/symbols/32/color/ion.png"
              />
              <span className="text-white text-sm ">
                {watch === 'overview' ? '5674' : '63754'} veION
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start w-full h-min rounded-md bg-grayone px-6 py-4">
        <div className="bg-grayUnselect rounded-md mb-3">
          <Toggle
            setActiveToggle={(val) =>
              router.push(`/veion/governance?watch=${watch}&view=${val}`)
            }
            arrText={['MyVeion', 'Delegate veION']}
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-semibold">5 veion</span>
          <span className="text-xs  flex flex-col">
            My Voting Power : 1134{' '}
            <span className="text-white/50 text-xs ">10% of all veion</span>
          </span>
        </div>
        <div className="my-3 w-full">
          <FlatMap />
        </div>

        {view === 'MyVeion' && (
          <div
            className={`w-full gap-x-1 hidden md:grid  grid-cols-10 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
          >
            <h3 className={` col-span-1`}>ID</h3>
            <h3 className={` col-span-2`}>TOKENS LOCKED</h3>
            <h3 className={` col-span-1`}>LOCKED BLP</h3>
            <h3 className={` col-span-1`}>LOCK EXPIRES</h3>
            <h3 className={` col-span-1`}>VOTING POWER</h3>
            <h3 className={` col-span-2`}>NETWORK</h3>
          </div>
        )}

        {view === 'MyVeion' &&
          lockedData.map((data, idx) => (
            <MyveionRows
              key={idx}
              {...data}
            />
          ))}
        {view === 'Delegate veION' && (
          <div
            className={`w-full gap-x-1 hidden md:grid  grid-cols-10 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
          >
            <h3 className={` col-span-1`}>ID</h3>
            <h3 className={` col-span-2`}>TOKENS LOCKED</h3>
            <h3 className={` col-span-1`}>LOCKED BLP</h3>
            <h3 className={` col-span-1`}>LOCK EXPIRES</h3>
            <h3 className={` col-span-1`}>VOTING POWER</h3>
            <h3 className={` col-span-2`}>DELEGATED TO</h3>
            <h3 className={` col-span-1`}>NETWORK</h3>
          </div>
        )}

        {view === 'Delegate veION' &&
          lockedDataWithDelegate.map((data, idx) => (
            <UndelegateVeionRows
              key={idx}
              {...data}
            />
          ))}
      </div>
    </div>
  );
}

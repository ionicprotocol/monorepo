import CustomTooltip from '@ui/app/_components/CustomTooltip';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import EmissionsManagementTable from '@ui/app/_components/veion/EmissionsManagementTable';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { votingData } from '@ui/constants/mock';

export default function Vote() {
  const infoBlocks = [
    {
      label: 'Locked Value',
      value: '$7894',
      infoContent: 'This is the amount of ION you have locked.',
      icon: null
    },
    {
      label: 'Locked Until',
      value: '11 Jan 2026',
      infoContent: 'This is the date until your ION is locked.',
      icon: null
    },
    {
      label: 'My Voting Power',
      value: '5674 veION',
      infoContent: 'This is your current voting power.',
      icon: '/img/symbols/32/color/ion.png'
    }
  ];

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      {/* First Card */}
      <Card className="w-full bg-grayone">
        <CardHeader>
          <CardTitle>Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {infoBlocks.map((block) => (
              <div
                key={block.label}
                className="flex flex-col gap-1 mt-3"
              >
                <div className="text-white/60 text-xs flex items-center">
                  {block.label}
                  <CustomTooltip content={block.infoContent} />
                </div>
                <div className="text-white/60 text-xs flex items-center">
                  {block.icon && (
                    <img
                      alt="icon"
                      className="w-6 h-6 inline-block"
                      src={block.icon}
                    />
                  )}
                  <span className="text-white text-sm ml-1">{block.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Second Card */}
      <Card
        className="w-full"
        style={{ backgroundColor: '#212126ff' }}
      >
        <CardHeader>
          <CardTitle>Emissions Management</CardTitle>
        </CardHeader>
        <CardContent className="border-none">
          <div className="my-3 w-full">
            <FlatMap />
          </div>
          <EmissionsManagementTable data={votingData} />
        </CardContent>
      </Card>
    </div>
  );
}

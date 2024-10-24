/* eslint-disable @next/next/no-img-element */
'use client';

import { Info } from 'lucide-react';

import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import VotingRows from '@ui/app/_components/veion/VotingRows';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from '@ui/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@ui/components/ui/tooltip';
import { votingData } from '@ui/constants/mock';

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 ml-1 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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
    <div className="w-full flex flex-col items-start py-4 gap-y-2 bg-darkone">
      {/* First Card */}
      <Card className="w-full">
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
                  <InfoTooltip content={block.infoContent} />
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
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Emissions Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="my-3 w-full">
            <FlatMap />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>NETWORK</TableCell>
                <TableCell>SUPPLY ASSET</TableCell>
                <TableCell>TOTAL VOTES</TableCell>
                <TableCell>MY VOTES</TableCell>
                <TableCell>VOTE</TableCell> {/* Added VOTE column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {votingData.map((data) => (
                <VotingRows
                  key={data.id}
                  {...data}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

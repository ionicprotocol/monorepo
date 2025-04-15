import React from 'react';

import {
  InfoIcon,
  LockIcon,
  Users2Icon,
  ArrowRightIcon,
  ShieldIcon
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';

const DelegatedVeionInfo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center ml-3 cursor-pointer">
          <div className="group relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-sm group-hover:bg-accent/30 transition-all" />
            <div className="relative size-7 flex items-center justify-center rounded-full bg-black/40 border border-accent/40 hover:border-accent/60 backdrop-blur-sm transition-all cursor-help">
              <InfoIcon className="size-4 text-accent group-hover:text-white transition-colors" />
            </div>
            {/* More subtle pulse animation */}
            <div className="absolute inset-0 rounded-full border border-accent/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-black bg-opacity-90 border border-white/10 shadow-2xl backdrop-blur-lg w-full max-w-[520px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Users2Icon className="size-6 text-white" />
            Delegate veION
          </DialogTitle>
          <p className="text-sm text-white/60">
            Delegate your voting power to participate in governance while
            maintaining ownership of your tokens
          </p>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-white/90 flex items-center gap-2">
              <ArrowRightIcon className="size-5 text-accent" />
              Steps to Delegate
            </h3>
            <div className="grid gap-3">
              {[
                {
                  text: 'Convert your veION position to a permanent lock',
                  icon: <LockIcon className="size-4" />,
                  description: 'Permanent locks are required for delegation'
                },
                {
                  text: 'Enter delegate wallet address',
                  icon: <Users2Icon className="size-4" />,
                  description:
                    'The address you want to delegate voting power to'
                },
                {
                  text: 'Select target position ID',
                  icon: <ArrowRightIcon className="size-4" />,
                  description: 'Must also be a permanent lock'
                },
                {
                  text: 'Choose delegation amount',
                  icon: <InfoIcon className="size-4" />,
                  description: 'Specify how much voting power to delegate'
                }
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start group"
                >
                  <div className="flex items-center justify-center size-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-accent/50 transition-colors">
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/90 font-medium">{step.text}</p>
                    <p className="text-sm text-white/40">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-4">
            <h3 className="font-medium text-lg text-white/90 flex items-center gap-2">
              <ShieldIcon className="size-5 text-accent" />
              Important Notes
            </h3>
            <div className="grid gap-3 text-sm">
              {[
                {
                  title: 'Permanent Lock Required',
                  description:
                    'Both positions must be permanent locks for delegation'
                },
                {
                  title: 'Revocable Power',
                  description:
                    'Delegated voting power can be revoked at any time'
                },
                {
                  title: 'Ownership Retained',
                  description: "Delegation doesn't transfer token ownership"
                },
                {
                  title: 'Voting Period',
                  description:
                    'Delegates retain rights until current voting period ends'
                }
              ].map((note, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <div className="size-1.5 rounded-full bg-accent/50 mt-2" />
                  <div>
                    <span className="text-white/90 font-medium">
                      {note.title}:{' '}
                    </span>
                    <span className="text-white/60">{note.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DelegatedVeionInfo;

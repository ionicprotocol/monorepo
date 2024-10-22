import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@radix-ui/react-popover';

interface PopoverHintProps {
  content: string;
}

interface PopoverHintProps {
  content: string;
}

export default function InfoPopover({ content }: PopoverHintProps) {
  return (
    <Popover>
      <PopoverTrigger className="ml-1">
        <div className="w-4 h-4 inline-flex items-center justify-center rounded-full border border-white/20 text-xs">
          i
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-60 bg-graylite text-white text-sm border-white/10">
        {content}
      </PopoverContent>
    </Popover>
  );
}

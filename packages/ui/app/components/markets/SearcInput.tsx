import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@ui/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-white/40" />
      </div>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-10 pr-4 rounded-lg text-sm border-white/5 hover:border-white/10 focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors placeholder:text-white/30"
      />
    </div>
  );
};

export default SearchInput;

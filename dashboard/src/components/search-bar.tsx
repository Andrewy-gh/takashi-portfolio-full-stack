import { Search } from 'lucide-react';
import { Input } from './ui/input';

export function SearchBar({ onChange }: { onChange: (value: string) => void }) {
  return (
    <div className="relative flex-grow">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400" />
      <Input
        type="text"
        placeholder="Search"
        className="pl-8"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

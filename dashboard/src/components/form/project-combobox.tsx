import { useState } from 'react';
import { useFieldContext } from '@/hooks/form-context';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { GetProjectsSelectResponse } from '@/lib/projects.queries';

export default function ProjectCombobox({
  projects,
}: {
  projects: GetProjectsSelectResponse;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const field = useFieldContext<number | null>();

  const handleSelect = (project: GetProjectsSelectResponse[number]) => {
    field.setValue(
      field.state.value === project.id ? null : project.id
    );
    setPopoverOpen(false);
  };

  const handleReset = () => {
    field.setValue(null);
  };

  return (
    <div className="flex gap-4">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-[250px] justify-between"
          >
            {field.state.value
              ? projects.find((project) => project.id === field.state.value)
                  ?.name
              : 'Select project...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search project..." />
            <CommandList>
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name} // prop that handles the filtering
                    onSelect={() => handleSelect(project)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        field.state.value === project.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="secondary"
        onClick={handleReset}
      >
        Reset
      </Button>
    </div>
  );
}

"use client";

import * as React from "react";
import { add, format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { es } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({ date, setDate }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (newDay) => {
    if (!newDay) return;
    setDate(newDay);
    setOpen(false);
  };

  const formattedDate = React.useMemo(() => {
    if (date && isValid(date)) {
      return format(date, "do 'de' MMMM 'de' yyyy", { locale: es });
    }
    return null;
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !formattedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate || <span>Elegir una fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={es}
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
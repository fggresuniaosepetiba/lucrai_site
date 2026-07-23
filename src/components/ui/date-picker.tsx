"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, parseLocalDate } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: ComponentProps<typeof Calendar>["disabled"];
  placeholder?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  error,
  disabled,
  placeholder,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !value && "text-muted-foreground",
            error && "border-red-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : <span>{placeholder || "Selecionar data"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg overflow-hidden" align="start">
        <Calendar
          mode="single"
          defaultMonth={value ? parseLocalDate(value) : undefined}
          selected={value ? parseLocalDate(value) : undefined}
          disabled={disabled}
          onSelect={(d) => {
            if (d) {
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              onChange(dateStr);
              setOpen(false);
            }
          }}
          required
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Input } from "./input";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Pesquisar...",
  emptyText = "Nenhum resultado encontrado.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchRef, setSearchRef] = React.useState<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  React.useEffect(() => {
    if (open && searchRef) {
      searchRef.focus();
      setSelectedIndex(-1);
    }
    if (!open) {
      setSearch("");
    }
  }, [open, searchRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filtered.length) {
          onValueChange(filtered[selectedIndex].value);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <div
          className="flex items-center border-b border-border px-3"
          onKeyDown={handleKeyDown}
        >
          <Input
            ref={(el) => setSearchRef(el)}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(-1);
            }}
            className="border-0 shadow-none focus-visible:ring-0 px-0"
          />
        </div>
        <div
          className="max-h-48 overflow-y-auto p-1"
          role="listbox"
          onKeyDown={handleKeyDown}
        >
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            filtered.map((option, index) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                  index === selectedIndex && "bg-accent text-accent-foreground",
                  option.value === value
                    ? "bg-accent/50 text-accent-foreground"
                    : "text-popover-foreground"
                )}
              >
                <span
                  className={cn(
                    "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                    option.value === value ? "opacity-100" : "opacity-0"
                  )}
                >
                  <Check className="h-4 w-4" />
                </span>
                <span className="truncate">{option.label}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

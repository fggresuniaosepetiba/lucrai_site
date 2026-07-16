"use client";

import * as React from "react";
import { DayPicker, useDayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function MonthCaption({
  calendarMonth,
}: {
  calendarMonth: { date: Date };
}) {
  const { goToMonth, nextMonth, previousMonth, dayPickerProps } =
    useDayPicker();

  const monthValue = calendarMonth.date.getMonth();
  const yearValue = calendarMonth.date.getFullYear();

  const currentYear = new Date().getFullYear();
  const startYear =
    dayPickerProps.startMonth?.getFullYear() ?? currentYear - 10;
  const endYear = dayPickerProps.endMonth?.getFullYear() ?? currentYear + 10;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i).toLocaleDateString("pt-BR", {
      month: "long",
    }),
  }));

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    value: startYear + i,
    label: String(startYear + i),
  }));

  const hasNext = nextMonth !== undefined;
  const hasPrevious = previousMonth !== undefined;

  return (
    <div className="flex items-center justify-between gap-1 mb-2">
      <button
        type="button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!hasPrevious}
        className={cn(
          "inline-flex items-center justify-center",
          "h-8 w-8 shrink-0 rounded-lg border border-border/50 bg-popover",
          "text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
          "transition-colors"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <select
        value={monthValue}
        onChange={(e) => {
          const newMonth = parseInt(e.target.value);
          const newDate = new Date(calendarMonth.date);
          newDate.setMonth(newMonth);
          goToMonth(newDate);
        }}
        className="h-8 rounded-md border border-input bg-popover px-2 text-sm font-medium text-foreground cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        value={yearValue}
        onChange={(e) => {
          const newYear = parseInt(e.target.value);
          const newDate = new Date(calendarMonth.date);
          newDate.setFullYear(newYear);
          goToMonth(newDate);
        }}
        className="h-8 rounded-md border border-input bg-popover px-2 text-sm font-medium text-foreground cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      >
        {years.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>
      </div>
      <button
        type="button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!hasNext}
        className={cn(
          "inline-flex items-center justify-center",
          "h-8 w-8 shrink-0 rounded-lg border border-border/50 bg-popover",
          "text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
          "transition-colors"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Nav() {
  return <></>;
}

function Calendar({
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center",
        week: "flex w-full mt-0.5",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "h-9 w-9"
        ),
        day_button: cn(
          "inline-flex items-center justify-center rounded-full text-sm font-normal",
          "h-9 w-9 p-0 aria-selected:opacity-100",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-colors"
        ),
        selected: cn(
          "bg-primary text-primary-foreground rounded-full",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground"
        ),
        today: "ring-1 ring-primary/30 ring-inset font-semibold text-primary",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      locale={ptBR}
      components={{
        MonthCaption,
        Nav,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

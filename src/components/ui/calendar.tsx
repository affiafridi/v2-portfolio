'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium text-neutral-900',
        nav: 'flex items-center justify-between absolute inset-x-0 top-0',
        button_previous: cn(
          'h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors'
        ),
        button_next: cn(
          'h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-neutral-400 rounded-md w-8 font-normal text-[0.75rem]',
        week: 'flex w-full mt-1',
        day: 'h-8 w-8 text-center text-sm p-0 relative',
        day_button: cn(
          'h-8 w-8 p-0 font-normal rounded-md transition-colors hover:bg-neutral-100',
          'aria-selected:opacity-100'
        ),
        selected: 'bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white [&>button]:bg-neutral-900 [&>button]:text-white [&>button]:hover:bg-neutral-900',
        today: 'font-semibold text-neutral-900',
        outside: 'text-neutral-300',
        disabled: 'text-neutral-300 opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }

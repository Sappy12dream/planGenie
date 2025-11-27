'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({
    date,
    onDateChange,
    placeholder = 'Pick a date',
    disabled = false,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (selectedDate: Date | undefined) => {
        onDateChange(selectedDate);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDateChange(undefined);
    };

    const handlePresetClick = (days: number) => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        handleSelect(newDate);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                    {date && !disabled && (
                        <X
                            className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="border-b p-3">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetClick(0)}
                            className="flex-1"
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetClick(1)}
                            className="flex-1"
                        >
                            Tomorrow
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetClick(7)}
                            className="flex-1"
                        >
                            Next Week
                        </Button>
                    </div>
                </div>
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    disabled={{ before: new Date() }}
                    initialFocus
                    className="p-3"
                />
            </PopoverContent>
        </Popover>
    );
}

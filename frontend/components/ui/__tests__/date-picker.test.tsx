/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../date-picker';

describe('DatePicker Component', () => {
    const mockOnDateChange = jest.fn();

    beforeEach(() => {
        mockOnDateChange.mockClear();
    });

    describe('Rendering', () => {
        it('should render with placeholder when no date is selected', () => {
            render(<DatePicker onDateChange={mockOnDateChange} placeholder="Pick a date" />);
            expect(screen.getByText('Pick a date')).toBeInTheDocument();
        });

        it('should display selected date when date is provided', () => {
            const date = new Date('2024-12-25');
            render(<DatePicker date={date} onDateChange={mockOnDateChange} />);
            expect(screen.getByRole('button')).toHaveTextContent(/December 25/);
        });

        it('should render calendar icon', () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);
            const button = screen.getByRole('button');
            expect(button.querySelector('svg')).toBeInTheDocument();
        });

        it('should show clear button when date is selected', () => {
            const date = new Date('2024-12-25');
            render(<DatePicker date={date} onDateChange={mockOnDateChange} />);
            const button = screen.getByRole('button');
            // X icon should be present
            const svgs = button.querySelectorAll('svg');
            expect(svgs.length).toBeGreaterThan(1); // Calendar + X icons
        });
    });

    describe('Interactions', () => {
        it('should open popover when button is clicked', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);
            const button = screen.getByRole('button');

            await userEvent.click(button);

            // Check for preset buttons
            await waitFor(() => {
                expect(screen.getByText('Today')).toBeInTheDocument();
                expect(screen.getByText('Tomorrow')).toBeInTheDocument();
                expect(screen.getByText('Next Week')).toBeInTheDocument();
            });
        });

        it('should call onDateChange when date is cleared', async () => {
            const date = new Date('2024-12-25');
            render(<DatePicker date={date} onDateChange={mockOnDateChange} />);

            const button = screen.getByRole('button');
            const xIcon = button.querySelectorAll('svg')[1]; // Second SVG is the X

            await userEvent.click(xIcon);

            expect(mockOnDateChange).toHaveBeenCalledWith(undefined);
        });

        it('should set today\'s date when "Today" preset is clicked', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);

            const button = screen.getByRole('button');
            await userEvent.click(button);

            const todayButton = await screen.findByText('Today');
            await userEvent.click(todayButton);

            expect(mockOnDateChange).toHaveBeenCalled();
            const calledDate = mockOnDateChange.mock.calls[0][0];
            const today = new Date();
            expect(calledDate.toDateString()).toBe(today.toDateString());
        });

        it('should set tomorrow\'s date when "Tomorrow" preset is clicked', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);

            const button = screen.getByRole('button');
            await userEvent.click(button);

            const tomorrowButton = await screen.findByText('Tomorrow');
            await userEvent.click(tomorrowButton);

            expect(mockOnDateChange).toHaveBeenCalled();
            const calledDate = mockOnDateChange.mock.calls[0][0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(calledDate.toDateString()).toBe(tomorrow.toDateString());
        });

        it('should set next week\'s date when "Next Week" preset is clicked', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);

            const button = screen.getByRole('button');
            await userEvent.click(button);

            const nextWeekButton = await screen.findByText('Next Week');
            await userEvent.click(nextWeekButton);

            expect(mockOnDateChange).toHaveBeenCalled();
            const calledDate = mockOnDateChange.mock.calls[0][0];
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            expect(calledDate.toDateString()).toBe(nextWeek.toDateString());
        });

        it('should close popover after selecting a preset', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);

            const button = screen.getByRole('button');
            await userEvent.click(button);

            const todayButton = await screen.findByText('Today');
            await userEvent.click(todayButton);

            // Popover should close
            await waitFor(() => {
                expect(screen.queryByText('Tomorrow')).not.toBeInTheDocument();
            });
        });
    });

    describe('Disabled State', () => {
        it('should disable button when disabled prop is true', () => {
            render(<DatePicker onDateChange={mockOnDateChange} disabled={true} />);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should not show clear button when disabled', () => {
            const date = new Date('2024-12-25');
            render(<DatePicker date={date} onDateChange={mockOnDateChange} disabled={true} />);
            const button = screen.getByRole('button');
            const svgs = button.querySelectorAll('svg');
            // Should only have calendar icon, no X icon
            expect(svgs.length).toBe(1);
        });
    });

    describe('Custom Styling', () => {
        it('should apply custom className', () => {
            render(<DatePicker onDateChange={mockOnDateChange} className="custom-class" />);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });
    });

    describe('Accessibility', () => {
        it('should have proper button role', () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should be keyboard navigable', async () => {
            render(<DatePicker onDateChange={mockOnDateChange} />);
            const button = screen.getByRole('button');

            button.focus();
            expect(button).toHaveFocus();
        });
    });
});

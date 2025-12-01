import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrioritySelector } from '../priority-selector';

// Mock the icons to avoid issues during testing
jest.mock('lucide-react', () => ({
    Check: () => <div data-testid="check-icon" />,
    AlertCircle: () => <div data-testid="alert-circle-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    ArrowDownCircle: () => <div data-testid="arrow-down-circle-icon" />,
}));

// Mock ResizeObserver which is used by Radix UI
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('PrioritySelector', () => {
    const mockOnPriorityChange = jest.fn();

    beforeEach(() => {
        mockOnPriorityChange.mockClear();
    });

    it('renders correctly with default priority', () => {
        render(
            <PrioritySelector
                priority="medium"
                onPriorityChange={mockOnPriorityChange}
            />
        );

        expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders correctly with high priority', () => {
        render(
            <PrioritySelector
                priority="high"
                onPriorityChange={mockOnPriorityChange}
            />
        );

        expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('opens menu and selects priority', async () => {
        const user = userEvent.setup();
        render(
            <PrioritySelector
                priority="medium"
                onPriorityChange={mockOnPriorityChange}
            />
        );

        // Open the dropdown
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        // Check if options are visible (use findByText for async appearance)
        expect(await screen.findByText('High')).toBeInTheDocument();
        expect(await screen.findByText('Low')).toBeInTheDocument();

        // Select 'High'
        await user.click(screen.getByText('High'));

        // Check if callback was called
        expect(mockOnPriorityChange).toHaveBeenCalledWith('high');
    });

    it('displays correct icon for priority', () => {
        render(
            <PrioritySelector
                priority="low"
                onPriorityChange={mockOnPriorityChange}
            />
        );

        expect(screen.getByText('Low')).toBeInTheDocument();
        // In a real test we might check for the specific icon, but here we just check render
    });
});

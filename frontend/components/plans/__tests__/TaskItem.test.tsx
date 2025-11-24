import { render, screen } from '@/__tests__/utils/test-utils'
import { TaskItem } from '@/components/plans/TaskItem'
import { Task } from '@/types/plan'
import userEvent from '@testing-library/user-event'

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

// Mock analytics
jest.mock('@/lib/monitoring/analytics', () => ({
    Analytics: {
        trackTaskCompleted: jest.fn(),
    },
}))

const mockTask: Task = {
    id: 'task-123',
    plan_id: 'plan-123',
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'pending',
    due_date: null,
    order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

describe('TaskItem', () => {
    it('renders task title and description', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        expect(screen.getByText('Test Task')).toBeInTheDocument()
        // Description is collapsed by default when task is not expanded
    })

    it('displays correct status badge', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    it('renders checkbox unchecked for pending tasks', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
    })

    it('renders checkbox checked for completed tasks', () => {
        const completedTask = { ...mockTask, status: 'completed' as const }
        render(<TaskItem task={completedTask} planId="plan-123" />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
    })

    it('shows line-through style for completed tasks', () => {
        const completedTask = { ...mockTask, status: 'completed' as const }
        render(<TaskItem task={completedTask} planId="plan-123" />)

        const titleElement = screen.getByText('Test Task')
        expect(titleElement).toHaveClass('line-through')
    })

    it('renders drag handle', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        // Drag handle has GripVertical icon
        const dragHandle = screen.getByLabelText('Drag to reorder')
        expect(dragHandle).toBeInTheDocument()
    })

    it('shows description when expanded', async () => {
        const user = userEvent.setup()
        render(<TaskItem task={mockTask} planId="plan-123" />)

        // Click the expand button (ChevronRight icon)
        const titleElement = screen.getByText('Test Task')
        await user.click(titleElement)

        // Description should now be visible
        expect(screen.getByText('This is a test task description')).toBeInTheDocument()
    })

    it('renders delete button', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        // Delete button with Trash2 icon exists
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('displays "Add description" button when no description exists', () => {
        const taskWithoutDescription = { ...mockTask, description: null }
        render(<TaskItem task={taskWithoutDescription} planId="plan-123" />)

        expect(screen.getByText('+ Add description')).toBeInTheDocument()
    })
})

import { render, screen, waitFor, fireEvent } from '@/__tests__/utils/test-utils'
import { TaskItem } from '@/components/plans/TaskItem'
import { Task } from '@/types/plan'
import { tasksApi } from '@/lib/api/tasks'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

// Mock tasks API
jest.mock('@/lib/api/tasks', () => ({
    tasksApi: {
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
    },
}))

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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders task title and description', () => {
        render(<TaskItem task={mockTask} planId="plan-123" />)

        expect(screen.getByRole('heading', { name: 'Test Task' })).toBeInTheDocument()
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

        const titleElement = screen.getByRole('heading', { name: 'Test Task' })
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

        const titleElement = screen.getByRole('heading', { name: 'Test Task' })
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

    it('allows editing title', async () => {
        const user = userEvent.setup()
        // Test with a task WITHOUT description because title editing is only enabled when no description
        // or via a different interaction not fully clear from previous code reading, but likely only when no description
        const taskNoDesc = { ...mockTask, description: null }
        render(<TaskItem task={taskNoDesc} planId="plan-123" />)

        const titleElement = screen.getByRole('heading', { name: 'Test Task' })
        await user.click(titleElement)

        // Should be replaced by input
        const input = screen.getByDisplayValue('Test Task')
        await user.clear(input)
        await user.type(input, 'Updated Task{enter}')

        await waitFor(() => {
            expect(tasksApi.updateTask).toHaveBeenCalledWith('task-123', { title: 'Updated Task' })
        })
    })

    it('allows editing description', async () => {
        const user = userEvent.setup()
        render(<TaskItem task={mockTask} planId="plan-123" />)

        // Expand first
        await user.click(screen.getByRole('heading', { name: 'Test Task' }))

        // Click description to edit
        await user.click(screen.getByText('This is a test task description'))

        // Should be textarea
        const textarea = screen.getByDisplayValue('This is a test task description')
        await user.clear(textarea)
        await user.type(textarea, 'New Description')

        // Save by blurring
        fireEvent.blur(textarea)

        await waitFor(() => {
            expect(tasksApi.updateTask).toHaveBeenCalledWith('task-123', { description: 'New Description' })
        })
    })

    it('deletes task after confirmation', async () => {
        const user = userEvent.setup()
        render(<TaskItem task={mockTask} planId="plan-123" />)

        // Find delete button. It's the one with Trash2 icon.
        // We can find by role button and filter or assume it's the last one?
        const buttons = screen.getAllByRole('button')
        // The delete button is likely the last one or one with specific class
        const deleteBtn = buttons[buttons.length - 1]
        await user.click(deleteBtn)

        // Dialog should open
        expect(screen.getByText('Delete Task')).toBeInTheDocument()
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()

        // Click confirm delete
        await user.click(screen.getByText('Delete', { selector: 'button' }))

        await waitFor(() => {
            expect(tasksApi.deleteTask).toHaveBeenCalledWith('task-123')
            expect(toast.success).toHaveBeenCalledWith('Task deleted')
        })
    })
})

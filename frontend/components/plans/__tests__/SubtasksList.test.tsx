import { render, screen, waitFor, fireEvent } from '@/__tests__/utils/test-utils'
import { SubtasksList } from '@/components/plans/SubtasksList'
import { subtasksApi } from '@/lib/api/subtasks'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

// Mock subtasks API
jest.mock('@/lib/api/subtasks', () => ({
    subtasksApi: {
        getSubtasks: jest.fn(),
        createSubtask: jest.fn(),
        updateSubtask: jest.fn(),
        deleteSubtask: jest.fn(),
        generateSubtasks: jest.fn(),
    },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

const mockSubtasks = [
    {
        id: 'subtask-1',
        task_id: 'task-123',
        title: 'Subtask 1',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'subtask-2',
        task_id: 'task-123',
        title: 'Subtask 2',
        status: 'completed' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
]

describe('SubtasksList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (subtasksApi.getSubtasks as jest.Mock).mockResolvedValue(mockSubtasks)
    })

    it('renders subtasks list', async () => {
        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        await waitFor(() => {
            expect(screen.getByText('Subtask 1')).toBeInTheDocument()
            expect(screen.getByText('Subtask 2')).toBeInTheDocument()
        })
    })

    it('allows adding a new subtask', async () => {
        const user = userEvent.setup()
            ; (subtasksApi.createSubtask as jest.Mock).mockResolvedValue({
                id: 'subtask-3',
                title: 'New Subtask',
                status: 'pending',
            })

        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        // Click add button
        const addBtn = await screen.findByRole('button', { name: /add subtask/i })
        await user.click(addBtn)

        // Type in input
        const input = screen.getByPlaceholderText('Add a subtask...')
        await user.type(input, 'New Subtask')

        // Click Add
        await user.click(screen.getByRole('button', { name: /^add$/i }))

        await waitFor(() => {
            expect(subtasksApi.createSubtask).toHaveBeenCalledWith('task-123', {
                title: 'New Subtask',
            })
            expect(toast.success).toHaveBeenCalledWith('Subtask added')
        })
    })

    it('toggles subtask status', async () => {
        const user = userEvent.setup()
        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        await waitFor(() => {
            expect(screen.getByText('Subtask 1')).toBeInTheDocument()
        })

        // Find checkbox for first subtask (pending)
        const checkboxes = screen.getAllByRole('checkbox')
        await user.click(checkboxes[0])

        await waitFor(() => {
            expect(subtasksApi.updateSubtask).toHaveBeenCalledWith('subtask-1', {
                status: 'completed',
            })
        })
    })

    it('deletes a subtask', async () => {
        const user = userEvent.setup()
        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        await waitFor(() => {
            expect(screen.getByText('Subtask 1')).toBeInTheDocument()
        })

        // Find delete button (Trash2 icon)
        const buttons = screen.getAllByRole('button')
        const deleteBtn = buttons.find(btn => !btn.textContent)

        if (!deleteBtn) throw new Error('Delete button not found')

        await user.click(deleteBtn)

        await waitFor(() => {
            expect(subtasksApi.deleteSubtask).toHaveBeenCalledWith('subtask-1')
            expect(toast.success).toHaveBeenCalledWith('Subtask deleted')
        })
    })

    it('shows generate with AI button when no subtasks', async () => {
        ; (subtasksApi.getSubtasks as jest.Mock).mockResolvedValue([])
        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument()
        })
    })

    it('calls generate API when AI button clicked', async () => {
        const user = userEvent.setup()
            ; (subtasksApi.getSubtasks as jest.Mock).mockResolvedValue([])
        render(<SubtasksList taskId="task-123" taskTitle="Test Task" />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /generate with ai/i }))

        await waitFor(() => {
            expect(subtasksApi.generateSubtasks).toHaveBeenCalledWith('task-123', 'Test Task', undefined)
        })
    })
})

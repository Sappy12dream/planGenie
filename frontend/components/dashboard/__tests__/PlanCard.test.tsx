import { render, screen } from '@/__tests__/utils/test-utils'
import { PlanCard } from '@/components/dashboard/PlanCard'
import { Plan } from '@/types/plan'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

const mockPlan: Plan = {
    id: 'plan-123',
    user_id: 'user-123',
    title: 'Test Plan',
    description: 'This is a test plan description',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tasks: [
        {
            id: 'task-1',
            plan_id: 'plan-123',
            title: 'Task 1',
            description: null,
            status: 'completed',
            due_date: null,
            order: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: 'task-2',
            plan_id: 'plan-123',
            title: 'Task 2',
            description: null,
            status: 'pending',
            due_date: null,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
    ],
    resources: [
        {
            id: 'res-1',
            plan_id: 'plan-123',
            title: 'Resource 1',
            url: 'https://example.com',
            type: 'link',
            created_at: '2024-01-01T00:00:00Z',
        },
    ],
}

describe('PlanCard', () => {
    beforeEach(() => {
        mockPush.mockClear()
    })

    it('renders plan title and description', () => {
        render(<PlanCard plan={mockPlan} />)

        expect(screen.getByText('Test Plan')).toBeInTheDocument()
        expect(screen.getByText('This is a test plan description')).toBeInTheDocument()
    })

    it('displays correct status badge', () => {
        render(<PlanCard plan={mockPlan} />)

        expect(screen.getByText('active')).toBeInTheDocument()
    })

    it('calculates and displays progress correctly', () => {
        render(<PlanCard plan={mockPlan} />)

        // 1 out of 2 tasks completed = 50%
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('displays task count correctly', () => {
        render(<PlanCard plan={mockPlan} />)

        expect(screen.getByText('1/2')).toBeInTheDocument() // 1 completed / 2 total
    })

    it('displays resource count', () => {
        render(<PlanCard plan={mockPlan} />)

        expect(screen.getByText('1')).toBeInTheDocument() // 1 resource
    })

    it('navigates to plan detail on click', async () => {
        const user = userEvent.setup()
        render(<PlanCard plan={mockPlan} />)

        const titleElement = screen.getByText('Test Plan')
        await user.click(titleElement)

        expect(mockPush).toHaveBeenCalledWith('/plans/plan-123')
    })

    it('displays created date', () => {
        render(<PlanCard plan={mockPlan} />)

        expect(screen.getByText(/Created/)).toBeInTheDocument()
    })

    it('shows 0% progress when no tasks exist', () => {
        const planWithNoTasks = { ...mockPlan, tasks: [] }
        render(<PlanCard plan={planWithNoTasks} />)

        expect(screen.getByText('0%')).toBeInTheDocument()
    })
})

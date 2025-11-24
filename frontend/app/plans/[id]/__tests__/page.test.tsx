import { render, screen, waitFor, fireEvent } from '@/__tests__/utils/test-utils'
import PlanPage from '@/app/plans/[id]/page'
import { plansApi } from '@/lib/api/plans'
import userEvent from '@testing-library/user-event'
import { useParams } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/api/plans', () => ({
    plansApi: {
        getPlan: jest.fn(),
    },
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
    useParams: jest.fn(),
}))

jest.mock('@/components/plans/PlanDisplay', () => ({
    PlanDisplay: ({ plan }: { plan: any }) => (
        <div data-testid="plan-display">{plan.title}</div>
    ),
}))

jest.mock('@/components/plans/ChatSidebar', () => ({
    ChatSidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
        isOpen ? (
            <div data-testid="chat-sidebar">
                Chat Sidebar
                <button onClick={onClose}>Close Chat</button>
            </div>
        ) : null
    ),
}))

// Mock ProtectedRoute
jest.mock('@/components/auth/ProtectedRoute', () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockPlan = {
    id: 'plan-123',
    title: 'Test Plan',
    description: 'Test Description',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tasks: [],
}

describe('PlanPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useParams as jest.Mock).mockReturnValue({ id: 'plan-123' })
            ; (plansApi.getPlan as jest.Mock).mockResolvedValue(mockPlan)
    })

    it('renders plan details when loaded', async () => {
        render(<PlanPage />)

        await waitFor(() => {
            expect(screen.getByTestId('plan-display')).toHaveTextContent('Test Plan')
        })
    })

    it('shows loading skeleton initially', () => {
        // Make promise never resolve to test loading state
        ; (plansApi.getPlan as jest.Mock).mockReturnValue(new Promise(() => { }))
        render(<PlanPage />)

        // Skeleton usually has no text, but we can check for class or structure
        // Or just check that plan display is NOT there
        expect(screen.queryByTestId('plan-display')).not.toBeInTheDocument()
        // We can check for skeleton elements if we want, but simple check is enough
    })

    it('shows error message on failure', async () => {
        ; (plansApi.getPlan as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))
        render(<PlanPage />)

        await waitFor(() => {
            expect(screen.getByText('Failed to load plan')).toBeInTheDocument()
            expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
        })
    })

    it('shows not found message when plan is null', async () => {
        ; (plansApi.getPlan as jest.Mock).mockResolvedValue(null)
        render(<PlanPage />)

        await waitFor(() => {
            expect(screen.getByText('Plan not found')).toBeInTheDocument()
        })
    })

    it('opens and closes chat sidebar', async () => {
        const user = userEvent.setup()
        render(<PlanPage />)

        await waitFor(() => {
            expect(screen.getByTestId('plan-display')).toBeInTheDocument()
        })

        // Chat should be closed initially
        expect(screen.queryByTestId('chat-sidebar')).not.toBeInTheDocument()

        // Click AI Assistant button
        await user.click(screen.getByText('AI Assistant'))

        // Chat should be open
        expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument()

        // Close chat
        await user.click(screen.getByText('Close Chat'))

        // Chat should be closed
        expect(screen.queryByTestId('chat-sidebar')).not.toBeInTheDocument()
    })
})

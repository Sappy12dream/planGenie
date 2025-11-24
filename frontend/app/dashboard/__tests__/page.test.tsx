import { render, screen, waitFor, fireEvent } from '@/__tests__/utils/test-utils'
import DashboardPage from '@/app/dashboard/page'
import { plansApi } from '@/lib/api/plans'
import { useAuth } from '@/lib/auth/AuthContext'
import userEvent from '@testing-library/user-event'

// Mock dependencies
jest.mock('@/lib/api/plans', () => ({
    plansApi: {
        getStats: jest.fn(),
        getAllPlans: jest.fn(),
    },
}))

jest.mock('@/lib/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}))

jest.mock('@/components/tutorial/Tutorial', () => ({
    Tutorial: () => <div data-testid="tutorial-mock" />,
}))

jest.mock('@/components/HelpButton', () => ({
    HelpButton: () => <div data-testid="help-button-mock" />,
}))

// Mock ProtectedRoute to just render children
jest.mock('@/components/auth/ProtectedRoute', () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
}

const mockStats = {
    active: 5,
    completed: 2,
    archived: 1,
}

const mockPlans = [
    {
        id: 'plan-1',
        title: 'Plan 1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        tasks: [],
    },
    {
        id: 'plan-2',
        title: 'Plan 2',
        status: 'completed',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        tasks: [],
    },
]

describe('DashboardPage', () => {
    const mockSignOut = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                signOut: mockSignOut,
            })
            ; (plansApi.getStats as jest.Mock).mockResolvedValue(mockStats)
            ; (plansApi.getAllPlans as jest.Mock).mockResolvedValue(mockPlans)
    })

    it('renders dashboard with stats and plans', async () => {
        render(<DashboardPage />)

        // Check header
        expect(screen.getByText('My Plans')).toBeInTheDocument()
        expect(screen.getByText('PlanGenie')).toBeInTheDocument()

        // Check stats
        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument() // Active
            expect(screen.getByText('2')).toBeInTheDocument() // Completed
            expect(screen.getByText('1')).toBeInTheDocument() // Archived
        })

        // Check plans
        expect(screen.getByText('Plan 1')).toBeInTheDocument()
        expect(screen.getByText('Plan 2')).toBeInTheDocument()
    })

    it('handles empty state', async () => {
        ; (plansApi.getAllPlans as jest.Mock).mockResolvedValue([])
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('No plans yet')).toBeInTheDocument()
            expect(screen.getByText('Create your first plan to get started!')).toBeInTheDocument()
        })
    })

    it('filters plans when tabs are clicked', async () => {
        const user = userEvent.setup()
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Plan 1')).toBeInTheDocument()
        })

        // Click 'Active' filter
        await user.click(screen.getByText('Active', { selector: 'button' }))

        await waitFor(() => {
            expect(plansApi.getAllPlans).toHaveBeenCalledWith('active', 1, 9)
        })

        // Click 'Completed' filter
        await user.click(screen.getByText('Completed', { selector: 'button' }))

        await waitFor(() => {
            expect(plansApi.getAllPlans).toHaveBeenCalledWith('completed', 1, 9)
        })
    })

    it('loads more plans when "Load More" is clicked', async () => {
        const user = userEvent.setup()
        // Mock first page with 9 items (full page) to trigger hasNextPage
        const fullPage = Array(9).fill(null).map((_, i) => ({
            id: `plan-${i}`,
            title: `Plan ${i}`,
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            tasks: [],
        }))

            ; (plansApi.getAllPlans as jest.Mock).mockResolvedValue(fullPage)

        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Load More')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Load More'))

        await waitFor(() => {
            expect(plansApi.getAllPlans).toHaveBeenCalledWith(undefined, 2, 9)
        })
    })

    it('handles logout', async () => {
        const user = userEvent.setup()
        render(<DashboardPage />)

        // Open user menu
        // Click the initials directly
        await user.click(screen.getByText('TE'))

        // Click logout
        await user.click(screen.getByText('Logout'))

        expect(mockSignOut).toHaveBeenCalled()
    })
})

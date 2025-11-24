jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/profile/page';
import { plansApi } from '@/lib/api/plans';
import { useAuth } from '@/lib/auth/AuthContext';

jest.mock('@/lib/api/plans');
jest.mock('@/lib/auth/AuthContext');

const mockUser = { email: 'test@example.com', created_at: '2023-01-01T00:00:00Z' } as any;

describe('ProfilePage', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    });

    test('renders loading skeletons initially', async () => {
        (plansApi.getAllPlans as jest.Mock).mockResolvedValue([]);
        render(<ProfilePage />);
        expect(screen.getAllByRole('status')).toBeTruthy();
        await waitFor(() => expect(screen.getByText('Your Statistics')).toBeInTheDocument());
    });

    test('displays stats when data is loaded', async () => {
        const mockPlans = [
            { id: '1', status: 'active', tasks: [{ status: 'completed' }], title: 'Plan 1' },
            { id: '2', status: 'completed', tasks: [], title: 'Plan 2' },
        ];
        (plansApi.getAllPlans as jest.Mock).mockResolvedValue(mockPlans);
        render(<ProfilePage />);
        await waitFor(() => expect(screen.getByText('Total Plans')).toBeInTheDocument());
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // active plans
        expect(screen.getByText('1')).toBeInTheDocument(); // completed plans
    });

    test('handles API error', async () => {
        (plansApi.getAllPlans as jest.Mock).mockRejectedValue(new Error('API error'));
        render(<ProfilePage />);
        await waitFor(() => expect(screen.getByText(/failed to load/i)).toBeInTheDocument());
    });

    test('navigation buttons work', async () => {
        (plansApi.getAllPlans as jest.Mock).mockResolvedValue([]);
        const { router } = render(<ProfilePage />);
        const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
        await userEvent.click(backBtn);
        expect(router.push).toHaveBeenCalledWith('/dashboard');
        const settingsBtn = screen.getByRole('button', { name: /settings/i });
        await userEvent.click(settingsBtn);
        expect(router.push).toHaveBeenCalledWith('/profile/settings');
    });
});

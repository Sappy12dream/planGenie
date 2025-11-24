// frontend/app/new-plan/__tests__/page.test.tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import NewPlanPage from '@/app/new-plan/page';
import { useAuth } from '@/lib/auth/AuthContext';

jest.mock('@/lib/auth/AuthContext');

const mockUser = { email: 'test@example.com' } as any;

describe('NewPlanPage', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser, signOut: jest.fn() });
    });

    test('renders header and form', async () => {
        render(<NewPlanPage />);
        expect(screen.getByRole('heading', { name: /turn goals into/i })).toBeInTheDocument();
        expect(screen.getByText(/plan genie transforms your vague ideas/i)).toBeInTheDocument();
        // Check that PlanInputForm component is rendered (by its placeholder text)
        expect(screen.getByTestId('plan-input-form')).toBeInTheDocument();
    });

    test('back button navigates to dashboard', async () => {
        const { router } = render(<NewPlanPage />);
        const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
        await userEvent.click(backBtn);
        expect(router.push).toHaveBeenCalledWith('/dashboard');
    });
});

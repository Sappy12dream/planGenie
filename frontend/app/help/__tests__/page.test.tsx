// frontend/app/help/__tests__/page.test.tsx
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import HelpPage from '@/app/help/page';
import { useAuth } from '@/lib/auth/AuthContext';

jest.mock('@/lib/auth/AuthContext');

const mockUser = { email: 'test@example.com' } as any;

describe('HelpPage', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    });

    test('renders header and search input', async () => {
        render(<HelpPage />);
        expect(screen.getByRole('heading', { name: /how can we help you\?/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search for help.../i)).toBeInTheDocument();
    });

    test('filters sections based on search query', async () => {
        render(<HelpPage />);
        const search = screen.getByPlaceholderText(/search for help.../i);
        await userEvent.type(search, 'getting started');
        await waitFor(() => {
            expect(screen.getByText(/getting started/i)).toBeInTheDocument();
        });
        // Ensure a non‑matching section is not displayed
        expect(screen.queryByText(/managing tasks/i)).not.toBeInTheDocument();
    });

    test('shows no results message when filter yields nothing', async () => {
        render(<HelpPage />);
        const search = screen.getByPlaceholderText(/search for help.../i);
        await userEvent.type(search, 'nonexistentquery');
        await waitFor(() => {
            expect(screen.getByText(/no results found/i)).toBeInTheDocument();
        });
    });

    test('navigation back button works', async () => {
        const { router } = render(<HelpPage />);
        const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
        await userEvent.click(backBtn);
        expect(router.push).toHaveBeenCalledWith('/dashboard');
    });
});

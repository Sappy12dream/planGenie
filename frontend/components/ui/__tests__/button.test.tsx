import { render, screen } from '@/__tests__/utils/test-utils'
import { Button } from '@/components/ui/button'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click me</Button>)

        await user.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
        render(<Button disabled>Click me</Button>)
        expect(screen.getByText('Click me')).toBeDisabled()
    })

    it('applies variant styles', () => {
        const { rerender } = render(<Button variant="destructive">Delete</Button>)
        expect(screen.getByText('Delete')).toBeInTheDocument()

        rerender(<Button variant="outline">Cancel</Button>)
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
})

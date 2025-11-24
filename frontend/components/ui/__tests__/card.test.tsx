import { render, screen } from '@/__tests__/utils/test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
    it('renders card with children', () => {
        render(
            <Card>
                <div>Card content</div>
            </Card>
        )
        expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders card header with title and description', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
            </Card>
        )

        expect(screen.getByText('Card Title')).toBeInTheDocument()
        expect(screen.getByText('Card Description')).toBeInTheDocument()
    })

    it('renders card content and footer', () => {
        render(
            <Card>
                <CardContent>Main content here</CardContent>
                <CardFooter>Footer content</CardFooter>
            </Card>
        )

        expect(screen.getByText('Main content here')).toBeInTheDocument()
        expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(
            <Card className="custom-class">Content</Card>
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })
})

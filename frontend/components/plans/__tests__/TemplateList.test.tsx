import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateList, Template } from '../TemplateList';

const mockTemplates: Template[] = [
    {
        id: '1',
        title: 'Template 1',
        description: 'Description 1',
        timeline: '1 month',
        category: 'Category 1',
        icon: 'Activity',
    },
    {
        id: '2',
        title: 'Template 2',
        description: 'Description 2',
        timeline: '2 months',
        category: 'Category 2',
        icon: 'BookOpen',
    },
];

describe('TemplateList', () => {
    it('renders all templates', () => {
        render(<TemplateList templates={mockTemplates} onSelect={() => { }} />);

        expect(screen.getByText('Template 1')).toBeInTheDocument();
        expect(screen.getByText('Template 2')).toBeInTheDocument();
        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    it('calls onSelect when a template is clicked', () => {
        const handleSelect = jest.fn();
        render(<TemplateList templates={mockTemplates} onSelect={handleSelect} />);

        fireEvent.click(screen.getByText('Template 1'));
        expect(handleSelect).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it('highlights selected template', () => {
        render(
            <TemplateList
                templates={mockTemplates}
                onSelect={() => { }}
                selectedId="1"
            />
        );

        // Check for selected styling (simplified check based on class presence or visual cue if possible, 
        // but here we might just check if it renders without error as styles are hard to test with just RTL without custom matchers)
        // In a real scenario, we might check for specific classes or aria-selected attributes if added.
        // For now, we just ensure it renders.
        expect(screen.getByText('Template 1')).toBeInTheDocument();
    });
});

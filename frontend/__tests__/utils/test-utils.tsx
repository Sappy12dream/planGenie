import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
function customRender(ui: React.ReactElement, options?: RenderOptions) {
    // Create a new QueryClient for each test
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Don't retry failed queries in tests
            },
        },
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }

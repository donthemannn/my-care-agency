/* @jest-environment jsdom */
/**
 * Testing framework and libraries: Jest + @testing-library/react + @testing-library/jest-dom
 * If your repository uses Vitest instead, replace jest.mock with vi.mock and update imports accordingly.
 */

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import DashboardPage from '../page'
import { useUser } from '@clerk/nextjs'

// Mock next/link to behave like a simple anchor in tests
jest.mock('next/link', () => {
  const React = require('react')
  return function Link({ href, children, ...props }: any) {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock Clerk's useUser hook to control isLoaded and user state
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}))
const mockUseUser = useUser as unknown as jest.MockedFunction<any>

const setUserState = (isLoaded: boolean, firstName?: string | null) => {
  mockUseUser.mockReturnValue({
    isLoaded,
    user:
      firstName === undefined
        ? undefined
        : firstName === null
        ? null
        : { firstName },
  })
}

describe('DashboardPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading spinner while user is not loaded', () => {
    setUserState(false)
    const { container } = render(<DashboardPage />)
    // Spinner element uses animate-spin class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    // Main heading should not be present while loading
    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument()
  })

  it('greets the user by first name when available', () => {
    setUserState(true, 'Alex')
    render(<DashboardPage />)
    expect(screen.getByText('Welcome back, Alex!')).toBeInTheDocument()
  })

  it('falls back to "Agent" when user is missing', () => {
    setUserState(true, undefined)
    render(<DashboardPage />)
    expect(screen.getByText('Welcome back, Agent!')).toBeInTheDocument()
  })

  it('falls back to "Agent" when firstName is an empty string', () => {
    setUserState(true, '')
    render(<DashboardPage />)
    expect(screen.getByText('Welcome back, Agent!')).toBeInTheDocument()
  })

  it('renders quick action links with correct destinations', () => {
    setUserState(true, 'Sam')
    render(<DashboardPage />)

    // Quick Actions
    expect(
      screen.getByRole('link', { name: /Generate Alabama Quote/i })
    ).toHaveAttribute('href', '/quoting/quotes/alabama')

    expect(
      screen.getByRole('link', { name: /View Quote History/i })
    ).toHaveAttribute('href', '/quoting/quotes')

    expect(
      screen.getByRole('link', { name: /Account Settings/i })
    ).toHaveAttribute('href', '/settings')

    // Getting Started CTA
    expect(
      screen.getByRole('link', { name: /Start Your First Quote/i })
    ).toHaveAttribute('href', '/quoting/quotes/alabama')
  })

  it('displays system integration statuses correctly', () => {
    setUserState(true, 'Sam')
    render(<DashboardPage />)

    expect(screen.getByText('CMS Marketplace API')).toBeInTheDocument()
    expect(screen.getByText('SmartyStreets API')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Alabama Plan Data')).toBeInTheDocument()

    // Three "Connected" labels and one "Available"
    expect(screen.getAllByText('Connected')).toHaveLength(3)
    expect(screen.getByText('Available')).toBeInTheDocument()

    // Footer note
    expect(
      screen.getByText(/All systems operational\. Ready for production use\./i)
    ).toBeInTheDocument()
  })

  it('shows stats overview callouts and descriptions', () => {
    setUserState(true, 'Sam')
    render(<DashboardPage />)

    // Total Quotes card
    expect(screen.getByText('Total Quotes')).toBeInTheDocument()
    expect(screen.getByText('Start generating quotes')).toBeInTheDocument()

    // Active States card
    expect(screen.getByText('Active States')).toBeInTheDocument()
    expect(screen.getByText('Alabama ready')).toBeInTheDocument()

    // System Status card
    expect(screen.getByText('System Status')).toBeInTheDocument()
    expect(screen.getByText('Online')).toBeInTheDocument()

    // ACA Plans card
    expect(screen.getByText('ACA Plans')).toBeInTheDocument()
    expect(screen.getByText('2025 plans loaded')).toBeInTheDocument()
  })

  it('renders the Getting Started section with steps and descriptions', () => {
    setUserState(true, 'Sam')
    render(<DashboardPage />)

    expect(screen.getByText('Getting Started')).toBeInTheDocument()

    // Step titles
    expect(screen.getByText('Enter Client Info')).toBeInTheDocument()
    expect(screen.getByText('Generate Quote')).toBeInTheDocument()
    expect(screen.getByText('Review & Share')).toBeInTheDocument()

    // Step descriptions
    expect(
      screen.getByText(/Collect basic information like age, income, and zip code/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Our system calculates subsidies and shows available plans/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Compare plans and share results with your client/i)
    ).toBeInTheDocument()
  })

  it('shows the tagline under the header when loaded', () => {
    setUserState(true, 'Sam')
    render(<DashboardPage />)
    expect(
      screen.getByText(
        /Your professional insurance management platform is ready\. Let's grow your business today\./i
      )
    ).toBeInTheDocument()
  })
})

export {}
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the Link component
jest.mock('next/link', () => {
  return ({ children, href, className, onClick }: any) => {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  };
});

describe('Navbar', () => {
  const usePathnameMock = jest.requireMock('next/navigation').usePathname;
  
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue('/');
  });

  it('renders the navbar with logo text', () => {
    render(<Navbar />);
    expect(screen.getByText('SONNET PROJECT')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('highlights the active link based on current path', () => {
    usePathnameMock.mockReturnValue('/orders');
    render(<Navbar />);
    
    // Get all links
    const links = screen.getAllByRole('link');
    
    // Find the Orders link
    const ordersLink = links.find(link => link.textContent === 'Orders');
    
    // Check if Orders link has the active class
    expect(ordersLink).toHaveClass('bg-red-500');
    expect(ordersLink).toHaveClass('text-white');
    
    // Check other links don't have the active class
    const homeLink = links.find(link => link.textContent === 'Home');
    expect(homeLink).not.toHaveClass('bg-red-500');
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Navbar />);
    
    // Get hamburger button
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    
    // Mobile menu is hidden by default
    expect(screen.getByText('Home').closest('div.sm\\:hidden')).toHaveClass('hidden');
    
    // Click hamburger button to open menu
    fireEvent.click(menuButton);
    
    // Mobile menu should now be visible
    expect(screen.getByText('Home').closest('div.sm\\:hidden')).toHaveClass('block');
    
    // Click hamburger button again to close menu
    fireEvent.click(menuButton);
    
    // Mobile menu should be hidden again
    expect(screen.getByText('Home').closest('div.sm\\:hidden')).toHaveClass('hidden');
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navbar />);
    
    // Get hamburger button and open menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);
    
    // Mobile menu should be visible
    expect(screen.getByText('Home').closest('div.sm\\:hidden')).toHaveClass('block');
    
    // Click a link in the mobile menu
    const aboutLink = screen.getAllByText('About')[1]; // Second About link (mobile version)
    fireEvent.click(aboutLink);
    
    // Mobile menu should be hidden after clicking a link
    expect(screen.getByText('Home').closest('div.sm\\:hidden')).toHaveClass('hidden');
  });

  it('renders different icons based on menu state', () => {
    render(<Navbar />);
    
    // When menu is closed, hamburger icon should be visible
    let hamburgerIcon = screen.getByRole('button').querySelector('svg:first-of-type');
    let closeIcon = screen.getByRole('button').querySelector('svg:last-of-type');
    
    expect(hamburgerIcon).toHaveClass('block');
    expect(closeIcon).toHaveClass('hidden');
    
    // Click button to open menu
    fireEvent.click(screen.getByRole('button'));
    
    // After menu opens, close icon should be visible and hamburger hidden
    hamburgerIcon = screen.getByRole('button').querySelector('svg:first-of-type');
    closeIcon = screen.getByRole('button').querySelector('svg:last-of-type');
    
    expect(hamburgerIcon).toHaveClass('hidden');
    expect(closeIcon).toHaveClass('block');
  });
});
import { render, screen } from '@testing-library/react';
import Home from './page';
import { OrderInformation } from './interface';

// Mock the Next.js components/modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the components
jest.mock('./components/OrderDetails', () => {
  return function MockOrderDetails({ Details }: { Details: any }) {
    return <div data-testid="order-details">Order Details Mock: {Details.orderId}</div>;
  };
});

jest.mock('./components/LookUp', () => {
  return function MockLookUp() {
    return <div data-testid="look-up">LookUp Mock</div>;
  };
});

// Mock the fetch function
global.fetch = jest.fn();

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.SERVICE_URL = 'http://test-service';
  });

  it('should render LookUp when no orderId is provided', async () => {
    // Arrange
    const searchParams = {}; // No orderId provided
    
    // Act
    const component = await Home({ searchParams });
    render(component);
    
    // Assert
    expect(screen.getByTestId('look-up')).toBeInTheDocument();
  });

  it('should render LookUp when orderId is provided but fetch returns null', async () => {
    // Arrange
    const searchParams = { orderId: '12345' };
    
    // Mock fetch to return a failed response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue(null),
    });
    
    // Act
    const component = await Home({ searchParams });
    render(component);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test-service/order?orderId=12345',
      expect.objectContaining({
        cache: 'no-store',
        next: { revalidate: 0 }
      })
    );
    expect(screen.getByTestId('look-up')).toBeInTheDocument();
  });

  it('should render OrderDetails when orderId is provided and fetch returns data', async () => {
    // Arrange
    const searchParams = { orderId: '12345' };
    const mockOrderData = {
      orderId: '12345',
      image: '/test-image.jpg',
      size: ['S', 'M', 'L'],
      color: ['Red', 'Blue'],
      value: 'Test / Red',
      title: 'Test Order'
    };
    
    // Mock fetch to return a successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockOrderData),
    });
    
    // Act
    const component = await Home({ searchParams });
    render(component);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test-service/order?orderId=12345',
      expect.objectContaining({
        cache: 'no-store',
        next: { revalidate: 0 }
      })
    );
    expect(screen.getByTestId('order-details')).toBeInTheDocument();
    expect(screen.getByText('Order Details Mock: 12345')).toBeInTheDocument();
  });

  it('should use default service URL when environment variable is not set', async () => {
    // Arrange
    const searchParams = { orderId: '12345' };
    process.env.SERVICE_URL = undefined;
    
    // Mock fetch to return a failed response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue(null),
    });
    
    // Act
    const component = await Home({ searchParams });
    render(component);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/order?orderId=12345',
      expect.objectContaining({
        cache: 'no-store',
        next: { revalidate: 0 }
      })
    );
  });

  it('should handle fetch error gracefully', async () => {
    // Arrange
    const searchParams = { orderId: '12345' };
    
    // Mock fetch to throw an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    // Act
    const component = await Home({ searchParams });
    render(component);
    
    // Assert
    expect(global.fetch).toHaveBeenCalled();
    // Should fallback to LookUp component
    expect(screen.getByTestId('look-up')).toBeInTheDocument();
  });
});
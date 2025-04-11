import { render, screen } from '@testing-library/react';
import Home from './page';
import { OrderInformation } from './interface';
import OrderDetails from './components/OrderDetails';
import LookUp from './components/LookUp';

// Mock the Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the components
jest.mock('./components/OrderDetails', () => {
  return jest.fn().mockImplementation(({ Details }) => {
    return <div data-testid="order-details">{Details?.title}</div>;
  });
});

jest.mock('./components/LookUp', () => {
  return jest.fn().mockImplementation(() => {
    return <div data-testid="lookup-component">Order Lookup Form</div>;
  });
});

// Mock the fetch function for testing
global.fetch = jest.fn();

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case: When no orderId is provided, the LookUp component should be rendered
  it('should render LookUp component when no orderId is provided', async () => {
    const { container } = render(await Home({ searchParams: {} }));
    expect(LookUp).toHaveBeenCalled();
    expect(screen.getByTestId('lookup-component')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  // Test case: When orderId is provided but fetch returns null, the LookUp component should be rendered
  it('should render LookUp component when order information is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(null),
    });

    const { container } = render(await Home({ searchParams: { orderId: '12345' } }));
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/order?orderId=12345'),
      expect.any(Object)
    );
    expect(LookUp).toHaveBeenCalled();
    expect(screen.getByTestId('lookup-component')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  // Test case: When orderId is provided and fetch returns data, the OrderDetails component should be rendered
  it('should render OrderDetails component when valid order information is found', async () => {
    const mockOrderData = {
      image: '/image.jpg',
      size: ['S', 'M', 'L'],
      color: ['Red', 'Blue'],
      value: 'Product / Red',
      title: 'Test Product',
      orderId: '12345'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockOrderData),
    });

    const { container } = render(await Home({ searchParams: { orderId: '12345' } }));
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/order?orderId=12345'),
      expect.any(Object)
    );
    expect(OrderDetails).toHaveBeenCalledWith(
      { Details: mockOrderData },
      expect.anything()
    );
    expect(screen.getByTestId('order-details')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  // Test case: When fetch fails (not ok), the LookUp component should be rendered
  it('should render LookUp component when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { container } = render(await Home({ searchParams: { orderId: '12345' } }));
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/order?orderId=12345'),
      expect.any(Object)
    );
    expect(LookUp).toHaveBeenCalled();
    expect(screen.getByTestId('lookup-component')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  // Test case: When SERVICE_URL is defined in environment, it should use that URL
  it('should use SERVICE_URL from environment when available', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, SERVICE_URL: 'https://test-api.example.com' };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(null),
    });

    await Home({ searchParams: { orderId: '12345' } });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-api.example.com/order?orderId=12345',
      expect.any(Object)
    );
    
    process.env = originalEnv;
  });

  // Test case: When SERVICE_URL is not defined, it should use the default localhost URL
  it('should use default localhost URL when SERVICE_URL is not defined', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.SERVICE_URL;
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(null),
    });

    await Home({ searchParams: { orderId: '12345' } });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/order?orderId=12345',
      expect.any(Object)
    );
    
    process.env = originalEnv;
  });
});
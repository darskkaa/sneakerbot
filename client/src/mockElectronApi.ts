// Mock implementation of Electron API for browser development
class MockElectronApi {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(channel: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
    
    // Return a function to remove this listener
    return () => {
      this.listeners[channel] = this.listeners[channel].filter(cb => cb !== callback);
    };
  }

  send(channel: string, ...args: any[]): void {
    console.log(`Mock send to ${channel}:`, ...args);
  }

  invoke<T>(channel: string, ...args: any[]): Promise<T> {
    console.log(`Mock invoke on ${channel}:`, ...args);
    
    // Mock responses based on channel
    if (channel === 'get-tasks') {
      return Promise.resolve([
        {
          id: 1,
          site: 'Nike',
          productUrl: 'https://nike.com/t/dunk-low-retro-mens-shoes-87q0hf/DD1391-100',
          sku: 'DD1391-100',
          size: 'US 10',
          status: 'idle',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as unknown as T);
    }
    
    if (channel === 'get-profiles') {
      return Promise.resolve([
        {
          id: '1',
          name: 'Personal Profile',
          shippingInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
            address1: '123 Main St',
            city: 'Boston',
            state: 'MA',
            zipCode: '02108',
            country: 'US'
          },
          billingInfo: {
            cardholderName: 'John Doe',
            cardNumber: '************1234',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '***',
            useShippingAsBilling: true
          }
        }
      ] as unknown as T);
    }
    
    if (channel === 'get-proxies') {
      return Promise.resolve([
        {
          id: '1',
          name: 'Residential Group',
          host: '192.168.1.1',
          port: 8080,
          username: 'user',
          password: 'pass',
          type: 'http',
          status: 'working',
          lastTested: new Date()
        }
      ] as unknown as T);
    }
    
    if (channel === 'get-settings') {
      return Promise.resolve({
        captchaProvider: 'manual',
        defaultCheckoutDelay: 1000,
        riskMode: 'balanced',
        autoUpdateEnabled: true
      } as unknown as T);
    }
    
    // Default empty response
    return Promise.resolve([] as unknown as T);
  }

  checkForUpdates(): void {
    console.log('Mock checking for updates');
  }
}

// Initialize the mock API
const mockApi = new MockElectronApi();

// Attach to window if in browser environment
if (typeof window !== 'undefined') {
  (window as any).api = mockApi;
}

export default mockApi;

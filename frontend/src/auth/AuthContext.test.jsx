import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../api/client';
import { MemoryRouter } from 'react-router-dom';

// Mock the api module
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    postWithCredentials: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestComponent = () => {
  const auth = useAuth();
  if (auth.loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <div data-testid="accessToken">{auth.accessToken}</div>
      <button onClick={() => auth.login('test@test.com', 'password')}>Login</button>
      <button onClick={() => auth.register({ email: 'test@test.com', password: 'password' })}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('should show loading state initially', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not have a user if no token is stored', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should fetch user if token is stored', async () => {
    window.localStorage.setItem('accessToken', 'test-token');
    const user = { id: 1, email: 'test@test.com' };
    api.get.mockResolvedValue(user);

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/me');
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(user));
  });

  it('should handle error when fetching user with stored token', async () => {
    window.localStorage.setItem('accessToken', 'test-token');
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/me');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(window.localStorage.getItem('accessToken')).toBe(null);
  });

  it('should login a user', async () => {
    const user = { id: 1, email: 'test@test.com' };
    const accessToken = 'new-token';
    api.post.mockResolvedValue({ user, accessToken });

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await act(async () => {
        screen.getByText('Login').click();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password' });
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(user));
    expect(window.localStorage.getItem('accessToken')).toBe(accessToken);
  });

  it('should register a user', async () => {
    const user = { id: 1, email: 'test@test.com' };
    const accessToken = 'new-token';
    api.post.mockResolvedValue({ user, accessToken });

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await act(async () => {
        screen.getByText('Register').click();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', { email: 'test@test.com', password: 'password' });
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(user));
    expect(window.localStorage.getItem('accessToken')).toBe(accessToken);
  });

  it('should logout a user', async () => {
    window.localStorage.setItem('accessToken', 'test-token');
    const user = { id: 1, email: 'test@test.com' };
    api.get.mockResolvedValue(user);

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(user));

    await act(async () => {
        screen.getByText('Logout').click();
    });

    expect(api.postWithCredentials).toHaveBeenCalledWith('/auth/logout', {});
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(window.localStorage.getItem('accessToken')).toBe(null);
  });

  it('should show session expired modal', async () => {
    window.localStorage.setItem('sessionExpired', 'true');

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Session expired')).toBeInTheDocument();
  });

  it('should close session expired modal and logout', async () => {
    window.localStorage.setItem('sessionExpired', 'true');

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await act(async () => {
        screen.getByText('OK').click();
    });

    expect(screen.queryByText('Session expired')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('sessionExpired')).toBe(null);
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

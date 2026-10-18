import {
  User,
  Wallet,
  WalletTransaction,
  ServiceItem,
  Country,
  SmsProvider,
  OtpOrder,
  SupportTicket,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'otp_auth_token';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  try {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } catch {
    // Cookie fallback
  }
};

export const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  try {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Cookie fallback
  }
};

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${res.status}`,
      };
    }

    return data as ApiResponse<T>;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error or backend offline';
    return {
      success: false,
      error: message,
    };
  }
}

export const api = {
  // 1. Health
  healthCheck: async () => {
    return request<{ status: string; service: string }>('/health');
  },

  // 2. Authentication
  auth: {
    login: async (email: string, password?: string) => {
      const res = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    register: async (name: string, email: string, password: string, phone?: string) => {
      const res = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      });
      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    loginAsDemoCustomer: async () => {
      const res = await request<{ user: User; token: string }>('/auth/demo-customer', {
        method: 'POST',
      });
      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    loginWithAdminKey: async (key: string) => {
      const res = await request<{ user: User; token: string }>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });
      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    getMe: async () => {
      return request<{ user: User }>('/auth/me');
    },

    logout: () => {
      removeStoredToken();
    },
  },

  // 3. Wallet
  wallet: {
    getBalance: async () => {
      return request<{ wallet: Wallet }>('/wallet/balance');
    },

    getTransactions: async (limit: number = 50) => {
      return request<{ transactions: WalletTransaction[] }>(`/wallet/transactions?limit=${limit}`);
    },

    createRecharge: async (amount: number, paymentMethod: string) => {
      return request<{
        transaction: WalletTransaction;
        gatewayOrderId: string;
        paymentUrl?: string;
      }>('/wallet/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    },

    verifyPayment: async (
      gatewayOrderId: string,
      paymentId: string,
      signature: string
    ) => {
      return request<{ transaction: WalletTransaction }>('/wallet/verify-payment', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId, paymentId, signature }),
      });
    },

    adminAdjust: async (
      userId: string,
      type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT',
      amount: number,
      reason: string
    ) => {
      return request<{ transaction: WalletTransaction; wallet: Wallet }>('/wallet/admin-adjust', {
        method: 'POST',
        body: JSON.stringify({ userId, type, amount, reason }),
      });
    },
  },

  // 4. Services & Providers
  services: {
    getAll: async (category?: string, countryCode?: string) => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (countryCode) params.set('countryCode', countryCode);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ services: ServiceItem[] }>(`/services${query}`);
    },

    getCountries: async () => {
      return request<{ countries: Country[] }>('/services/countries');
    },

    getProviders: async () => {
      return request<{ providers: SmsProvider[] }>('/services/providers');
    },

    updateService: async (id: string, updates: Partial<ServiceItem>) => {
      return request<{ service: ServiceItem }>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    toggleService: async (id: string) => {
      return request<{ service: ServiceItem }>(`/services/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    updateProvider: async (id: string, updates: Partial<SmsProvider>) => {
      return request<{ provider: SmsProvider }>(`/services/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    syncProvider: async (id: string) => {
      return request<{ provider: SmsProvider }>(`/services/providers/${id}/sync`, {
        method: 'POST',
      });
    },
  },

  // 5. OTP Orders
  otp: {
    createOrder: async (serviceId: string, countryCode: string = 'IN', operator?: string) => {
      return request<{ order: OtpOrder }>('/otp/orders', {
        method: 'POST',
        body: JSON.stringify({ serviceId, countryCode, operator }),
      });
    },

    getUserOrders: async () => {
      return request<{ orders: OtpOrder[] }>('/otp/orders');
    },

    getActiveOrder: async () => {
      return request<{ activeOrder: OtpOrder | null }>('/otp/orders/active');
    },

    getOrder: async (id: string) => {
      return request<{ order: OtpOrder }>(`/otp/orders/${id}`);
    },

    cancelOrder: async (id: string) => {
      return request<{ order: OtpOrder }>(`/otp/orders/${id}/cancel`, {
        method: 'POST',
      });
    },

    simulateSms: async (id: string, code?: string) => {
      return request<{ order: OtpOrder }>(`/otp/orders/${id}/simulate-sms`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },
  },

  // 6. Support Tickets
  tickets: {
    getAll: async () => {
      return request<{ tickets: SupportTicket[] }>('/tickets');
    },

    create: async (subject: string, category: string, message: string) => {
      return request<{ ticket: SupportTicket }>('/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, category, message }),
      });
    },

    reply: async (id: string, message: string) => {
      return request<{ ticket: SupportTicket }>(`/tickets/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
  },

  // 7. Admin Dashboard
  admin: {
    getKPIs: async () => {
      return request<{ kpis: unknown }>('/admin/kpis');
    },

    getUsers: async () => {
      return request<{ users: User[] }>('/admin/users');
    },

    toggleUser: async (userId: string) => {
      return request<{ user: User }>(`/admin/users/${userId}/toggle`, {
        method: 'PATCH',
      });
    },

    updateMargin: async (serviceId: string, minimumMargin: number) => {
      return request<{ service: ServiceItem }>(`/admin/pricing/margin`, {
        method: 'PATCH',
        body: JSON.stringify({ serviceId, minimumMargin }),
      });
    },
  },
};

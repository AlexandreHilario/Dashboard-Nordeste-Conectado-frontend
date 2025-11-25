import api from './api';

/**
 * PONTO DE INTEGRAÇÃO - AUTENTICAÇÃO
 * 
 * Endpoint esperado no backend: POST /auth/login
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id: string, name: string, email: string } }
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  /**
   * POST /auth/login
   * Autentica usuário e retorna JWT token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // MOCK - Aceita qualquer credencial para testes
    // TODO: Descomentar quando o backend estiver pronto
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // return response.data;
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Dados mockados
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
      }
    };
    
    // Salva token e dados do usuário no localStorage
    localStorage.setItem('auth_token', mockResponse.token);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  },

  /**
   * Logout local - limpa dados do localStorage
   * Opcionalmente, pode chamar endpoint POST /auth/logout no backend
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Retorna usuário atual do localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verifica se há token válido
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

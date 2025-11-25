import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define o tipo de dados do contexto
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Cria o contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica se tem usuário logado quando carrega a página
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authService.login({ email, password });
    setUser(response.user);
    toast.success('Login realizado!');
    navigate('/dashboard');
    setIsLoading(false);
  };

  // Função de logout
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Você saiu');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

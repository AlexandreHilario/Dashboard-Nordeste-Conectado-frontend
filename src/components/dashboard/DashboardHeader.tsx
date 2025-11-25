import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const DashboardHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard Nordeste Conectado</h1>
          <p className="text-sm text-muted-foreground">Informações sobre tecnologia na área rural do nordeste</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

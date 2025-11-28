import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github } from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // pega o login do AuthContext (que recebe email e senha)
  const { login, isLoading } = useAuth();

  // ----- LOGIN -----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(loginEmail, loginPassword); // agora está correto!
    } catch (err) {
      alert("Credenciais inválidas, tente novamente.");
    }
  };

  // ----- CADASTRO -----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao cadastrar");
        return;
      }

      alert("Cadastro realizado com sucesso!");

      
      await login(signupEmail, signupPassword);

    } catch (err) {
      alert("Erro ao conectar ao servidor");
    }
  };

  // ----- LOGIN DE SOCIAL (FAKE) -----
  const handleGoogleLogin = () => {
    alert("Login com Google em desenvolvimento");
  };

  const handleGithubLogin = () => {
    alert("Login com GitHub em desenvolvimento");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Dashboard Nordeste Conectado</h1>
          <p className="text-muted-foreground mt-2">Acesse sua conta ou crie uma nova</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="cadastro">Primeiro Cadastro</TabsTrigger>
          </TabsList>

          {/* --- ABA LOGIN --- */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 bg-card p-6 rounded-lg border">

              <div>
                <label className="text-sm font-medium">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  placeholder="senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou entre com redes sociais</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Login com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                >
                  <Github className="w-5 h-5" />
                  Login com GitHub
                </Button>
              </div>

            </form>
          </TabsContent>

          {/* --- ABA CADASTRO --- */}
          <TabsContent value="cadastro">
            <form onSubmit={handleSignup} className="space-y-4 bg-card p-6 rounded-lg border">

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Confirmar Senha</label>
                  <Input
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Cadastrando...' : 'Criar Conta'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou cadastre-se com redes sociais</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Cadastrar com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                >
                  <Github className="w-5 h-5" />
                  Cadastrar com GitHub
                </Button>
              </div>

            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;

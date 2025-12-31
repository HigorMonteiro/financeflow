import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const REMEMBER_ME_KEY = 'rememberedCredentials';

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedCredentials) {
      try {
        const { email, password } = JSON.parse(savedCredentials);
        setValue('email', email);
        setValue('password', password);
        setRememberMe(true);
      } catch (error) {
        // Se houver erro ao parsear, remove o item corrompido
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }, [setValue]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast({
        variant: 'success',
        title: 'Login realizado!',
        description: 'Bem-vindo de volta!',
      });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    
    // Salvar ou remover credenciais baseado no checkbox
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
        email: data.email,
        password: data.password,
      }));
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
          <CardDescription className="hidden md:block text-sm md:text-base">Entre com sua conta para continuar no SeOrganize</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Lembrar usuário e senha
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


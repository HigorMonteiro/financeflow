import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

export function UserSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: authService.me,
  });

  useEffect(() => {
    if (userData?.user) {
      setFormData({
        name: userData.user.name || '',
        email: userData.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [userData]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; password?: string; currentPassword?: string }) => {
      return authService.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        variant: 'success',
        title: 'Perfil atualizado!',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.response?.data?.error || 'Não foi possível atualizar o perfil. Tente novamente.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Senhas não coincidem',
        description: 'As senhas informadas não são iguais. Verifique e tente novamente.',
      });
      return;
    }

    const updateData: any = {};
    if (formData.name !== userData?.user.name) {
      updateData.name = formData.name;
    }
    if (formData.email !== userData?.user.email) {
      updateData.email = formData.email;
    }
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
      updateData.currentPassword = formData.currentPassword;
    }

    if (Object.keys(updateData).length > 0) {
      updateUserMutation.mutate(updateData);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Usuário</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>

              {formData.newPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!!formData.newPassword}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


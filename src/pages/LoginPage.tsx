import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  const cardShadow = '0 0 0 1px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.05), 0 12px 24px rgba(0,0,0,.05)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <button
        onClick={handleGuest}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <UserCircle className="h-5 w-5" />
        Войти как гость
      </button>

      <div
        className="w-full max-w-[400px] bg-card rounded-xl p-8"
        style={{ boxShadow: cardShadow }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Вход в систему</h1>
          <p className="text-sm text-muted-foreground mt-2">Платформа для создания заданий PECS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Введите логин"
              className="focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full transition-all duration-200 active:scale-[0.98]"
          >
            Войти
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Тестовый аккаунт: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

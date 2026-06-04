import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    console.log(success);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">

      <div className="w-full max-w-[420px] bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🧩</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Вход в систему</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Платформа для обучения детей с РАС</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold">Логин</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Введите логин"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="h-12 rounded-xl text-base"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">
            Войти
          </Button>
        </form>

        <div className="mt-6 space-y-1">
          <p className="text-xs text-muted-foreground text-center font-medium">Тестовые аккаунты:</p>
          <p className="text-xs text-muted-foreground text-center">👑 admin / admin123 &nbsp;|&nbsp; 🎓 educator / edu123 &nbsp;|&nbsp; 👨‍👩‍👧 parent / parent123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

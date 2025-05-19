import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../services/firebase';
import { CreditCard, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await loginApi(email, password);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        await registerApi(email, password);
        navigate('/');
      }
    } catch (error: any) {
      if (error.message?.includes('E-mail já cadastrado')) {
        setError('Este e-mail já está sendo utilizado.');
      } else if (error.message?.includes('E-mail ou senha incorretos')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(`Erro ao ${isLogin ? 'fazer login' : 'criar conta'}. Tente novamente.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <CreditCard className="h-8 w-8 text-blue-900 mr-2" />
            <h1 className="text-2xl font-bold text-blue-900">FinControl</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-6">
            {isLogin ? 'Faça login na sua conta' : 'Crie sua conta'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="label">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input"
                  required
                />
              </div>
            </div>
            
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </button>
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin mr-2">◌</span>
              ) : (
                <LogIn size={18} className="mr-2" />
              )}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
          
          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-slate-500">Ou continue com</span>
            </div>
          </div>
          
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
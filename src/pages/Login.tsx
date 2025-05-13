import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../services/firebase';
import { CreditCard, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Erro ao fazer login com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error: any) {
      console.error(error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está sendo utilizado.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
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
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
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
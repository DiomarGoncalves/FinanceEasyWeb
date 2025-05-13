import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
          <CreditCard size={48} className="text-blue-900" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Página não encontrada</h2>
        
        <p className="text-slate-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
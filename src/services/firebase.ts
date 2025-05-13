import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Substitua essas configurações pelas suas próprias credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "seu-app.firebaseapp.com",
  projectId: "seu-app",
  storageBucket: "seu-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Configurar o provedor do Google para solicitar acesso ao e-mail do usuário
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
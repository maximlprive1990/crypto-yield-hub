import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const LocalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('localAuth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('localAuth_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('localAuth_users') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === email);
      
      if (userExists) {
        const error = { message: 'Un utilisateur avec cet email existe déjà' };
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        email,
        username,
        created_at: new Date().toISOString()
      };

      // Store user data
      existingUsers.push({ ...newUser, password });
      localStorage.setItem('localAuth_users', JSON.stringify(existingUsers));
      localStorage.setItem('localAuth_user', JSON.stringify(newUser));
      
      setUser(newUser);
      
      toast({
        title: "Inscription réussie!",
        description: "Bienvenue sur DeadSpot!"
      });
      
      return { error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('localAuth_users') || '[]');
      const user = existingUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        const error = { message: 'Email ou mot de passe incorrect' };
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      const userData = { ...user };
      delete userData.password;
      
      localStorage.setItem('localAuth_user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Connexion réussie!",
        description: "Bienvenue sur DeadSpot!"
      });
      
      return { error: null };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('localAuth_user');
      setUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!"
      });
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: user ? { user } : null,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useLocalAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
};
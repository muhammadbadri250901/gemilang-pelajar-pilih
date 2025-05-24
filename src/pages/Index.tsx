
import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
      setAuthError("Terjadi kesalahan saat memverifikasi sesi login");
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memverifikasi sesi login",
        variant: "destructive",
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setAuthError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthError("Gagal memuat profil pengguna");
        return;
      }

      if (data) {
        setUserProfile({
          username: data.username || user?.email || 'User',
          role: data.role || 'user'
        });
      } else {
        // If no profile exists, create one
        const newProfile = {
          id: userId,
          username: user?.email || 'User',
          role: 'user'
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        
        setUserProfile({
          username: newProfile.username,
          role: newProfile.role
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setAuthError("Terjadi kesalahan saat memuat profil");
    }
  };

  const handleLogin = (userData: { username: string; role: string }) => {
    setUserProfile(userData);
    setAuthError(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <p className="text-red-600 mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={userProfile} onLogout={handleLogout} />;
};

export default Index;

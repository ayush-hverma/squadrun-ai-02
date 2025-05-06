import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GoogleSignIn() {
  const { login, user, logout } = useAuth();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      await login(credentialResponse.credential);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error('Sign in failed', {
        description: error.message || 'You are not authorized to access this application.'
      });
    }
  };

  const handleError = () => {
    toast.error('Sign in failed', {
      description: 'There was an error signing in with Google.'
    });
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm">{user.name}</span>
        <Button
          variant="ghost"
          onClick={logout}
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
      theme="filled_black"
      shape="rectangular"
      text="signin_with"
      locale="en"
    />
  );
} 
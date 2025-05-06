import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignIn() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Current origin:', window.location.origin);
      await login(credentialResponse.credential);
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Sign in failed', {
        description: error.message || 'You are not authorized to access this application.'
      });
    }
  };

  const handleError = () => {
    console.error('Google Sign-In error: Origin not allowed');
    toast.error('Sign in failed', {
      description: 'There was an error signing in with Google. Please check if your domain is authorized.'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-squadrun-darker">
      <Card className="w-[400px] bg-squadrun-darker/50 border-squadrun-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center text-[#472373]/[0.53]">
            <span className="text-squadrun-primary">Squad</span>
            <span className="text-white">Run</span>
            <span className="text-squadrun-primary ml-1">AI</span>
          </CardTitle>
          <p className="text-sm text-squadrun-gray mt-2">Code Intelligence Suite</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-squadrun-gray text-center">
            Please sign in with your authorized Google account to access the dashboard.
          </p>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
            locale="en"
          />
        </CardContent>
      </Card>
    </div>
  );
} 
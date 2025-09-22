import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { checkTestHistory } from '@/lib/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [checkingHistory, setCheckingHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // Function to check test history after successful login
  const checkUserTestHistory = async (authToken: string) => {
    setCheckingHistory(true);
    try {
      const historyResult = await checkTestHistory(authToken);
      
      if (historyResult.hasTakenTest && historyResult.latestTest) {
        // User has taken test before, navigate to test options page
        navigate('/test-options', { 
          state: { 
            testData: historyResult.latestTest 
          } 
        });
      } else {
        // User hasn't taken test, go to main page (normal flow)
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to check test history:', error);
      // On error, proceed to main page
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } finally {
      setCheckingHistory(false);
    }
  };

  // Handle success message and pre-fill email from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await authLogin(email, password);
      if (success) {
        setLoginSuccess(true);
        setSuccessMessage('Login successful! Checking your test history...');
        
        // Get the token from localStorage (it's saved by authLogin)
        const authToken = localStorage.getItem('token');
        if (authToken) {
          // Check test history before redirecting
          await checkUserTestHistory(authToken);
        } else {
          // Fallback if no token found
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
              {successMessage && (
                <Alert className={`mb-4 ${loginSuccess ? 'border-green-200 bg-green-50' : 'border-green-200 bg-green-50'}`}>
                  <AlertDescription className={`${loginSuccess ? 'text-green-800 font-medium' : 'text-green-800'}`}>
                    {successMessage}
                    {checkingHistory && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span className="text-sm">Checking your assessment history...</span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {!loginSuccess ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Welcome back!</p>
                    <p className="text-sm text-gray-500">
                      {checkingHistory ? 'Checking your assessment history...' : 'Preparing your experience...'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
  );
}
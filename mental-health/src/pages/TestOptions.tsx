import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, RotateCcw, TrendingUp, Calendar, Brain, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkTestHistory } from "@/lib/api";

interface TestData {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAge: number;
  course: string;
  year: string;
  answers: Record<string, string>;
  responses: Record<string, string>;
  timestamp: string;
  calculatedRiskScore?: number;
  tags?: string[];
}

export default function TestOptions() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  useEffect(() => {
    // Get test data from navigation state
    const stateData = location.state?.testData;
    if (stateData) {
      setTestData(stateData);
      setLoading(false);
    } else {
      // If no test data provided, try to fetch it from API
      fetchTestHistory();
    }
  }, [location.state, navigate]);

  // Function to fetch test history if not provided in state
  const fetchTestHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { replace: true });
        return;
      }

      const historyResult = await checkTestHistory(token);
      
      if (historyResult.hasTakenTest && historyResult.latestTest) {
        setTestData(historyResult.latestTest);
      } else {
        // User hasn't taken test, redirect to main page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Failed to fetch test history:', error);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Format the date for display
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get risk level from tags or calculate from score
  const getRiskLevel = () => {
    if (testData?.tags) {
      if (testData.tags.includes('high_risk')) return 'High Risk';
      if (testData.tags.includes('moderate_risk')) return 'Medium Risk';
      if (testData.tags.includes('low_risk')) return 'Low Risk';
    }
    return 'Assessment Available';
  };

  const getRiskColor = () => {
    const level = getRiskLevel();
    if (level.includes('High')) return 'text-red-600 bg-red-50 border-red-200';
    if (level.includes('Medium')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (level.includes('Low')) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const handleRetakeTest = () => {
    // Navigate to main page to start fresh test
    navigate('/');
  };

  const handleContinueWithOldResults = () => {
    // Navigate to risk assessment results page with previous data
    navigate('/previous-results', { 
      state: { 
        results: {
          course: testData?.course || '',
          year: testData?.year || '',
          answers: testData?.answers || {},
          responses: testData?.responses || {}
        }
      } 
    });
  };

  const handleBackToSignIn = () => {
    // Logout and redirect to signin
    logout();
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">No Test Data Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find your previous test data.</p>
            <Button onClick={() => navigate('/signin')}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = Object.keys(testData.answers || {}).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logout */}
      <header className="flex justify-between items-center p-4">
        <Button variant="ghost" size="sm" onClick={handleBackToSignIn}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">We found your previous mental health assessment</p>
        </div>

        {/* Previous Test Summary */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>Previous Assessment Found:</strong> You completed a mental health assessment on{' '}
            <strong>{formatDate(testData.timestamp)}</strong>. 
            You can either continue with your previous results or take a fresh assessment.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Previous Test Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Previous Assessment Details
              </CardTitle>
              <CardDescription>
                Your last mental health screening results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Course:</span>
                  <p className="text-gray-900">{testData.course || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Year:</span>
                  <p className="text-gray-900">{testData.year || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Questions Answered:</span>
                  <p className="text-gray-900">{totalQuestions} questions</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Completed:</span>
                  <p className="text-gray-900">{formatDate(testData.timestamp)}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <span className="font-medium text-gray-600">Assessment Result:</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 border ${getRiskColor()}`}>
                  <TrendingUp className="w-4 h-4" />
                  {getRiskLevel()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options Card */}
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
              <CardDescription>
                Choose how you'd like to proceed with your mental health assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Continue with Old Results */}
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Continue with Previous Results</h3>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  View your previous assessment results and get personalized recommendations based on your earlier responses.
                </p>
                <Button 
                  onClick={handleContinueWithOldResults}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  View Previous Results
                </Button>
              </div>

              {/* Retake Test */}
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3 mb-2">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Take a Fresh Assessment</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Take a new mental health assessment to get updated results that reflect your current wellbeing.
                </p>
                <Button 
                  onClick={handleRetakeTest}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  Retake Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Why might you want to retake the assessment?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your mental health status may have changed since your last assessment</li>
                  <li>• You want to track your progress over time</li>
                  <li>• You feel your previous responses don't reflect your current state</li>
                  <li>• It's been a while since your last assessment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center mt-6 p-4 bg-white/60 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            🔒 Your assessment data is completely confidential and secure. All responses are encrypted and only used to provide you with personalized mental health support.
          </p>
        </div>
      </div>
    </div>
  );
}
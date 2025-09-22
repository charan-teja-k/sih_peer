import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WelcomeHero } from "@/components/WelcomeHero";
import { ChatbotScreening } from "@/components/ChatbotScreening";
import { RiskAssessmentResults } from "@/components/RiskAssessmentResults";
import { ResourceHub } from "@/components/ResourceHub";
import PeerSupportCommunity from "@/components/PeerSupportCommunity";
import CounselorBooking from "@/components/CounselorBooking";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { apiPost } from "@/lib/api";

type AppState = 'welcome' | 'screening' | 'results' | 'resources' | 'peer-support' | 'counselor-booking';

interface AssessmentResults {
  course: string;
  year: string;
  answers: Record<string, string>;
  responses: Record<string, string>;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const { logout, user } = useAuth();
  const location = useLocation();

  // Check if we received previous test results from navigation (for "continue with old results" flow)
  useEffect(() => {
    if (location.state?.results) {
      const previousResults = location.state.results as AssessmentResults;
      setAssessmentResults(previousResults);
      setCurrentState('results');
      // Clear the state to prevent it from persisting on browser back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // SEO: Set document title based on current state
  useEffect(() => {
    const titles = {
      welcome: 'Mind Companion - Your AI Mental Health Companion',
      screening: 'Wellness Assessment - Mind Companion',
      results: 'Your Results - Mind Companion', 
      resources: 'Resource Hub - Mind Companion',
      'peer-support': 'Peer Support Community - Mind Companion',
      'counselor-booking': 'Book Counselor - Mind Companion'
    };
    document.title = titles[currentState];
  }, [currentState]);

  const handleStartScreening = () => {
    setCurrentState('screening');
  };

  const handleScreeningComplete = async (results: AssessmentResults) => {
    console.log('handleScreeningComplete called with:', results);
    try {
      // Save assessment to backend
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? `Found: ${token.substring(0, 20)}...` : 'Not found');
      
      if (!token) {
        console.error('❌ No auth token found in localStorage');
        alert('Authentication error: Please login again');
        return;
      }
      
      if (token) {
        const questionData = {
          course: results.course,
          year: results.year,
          answers: results.answers, // Text responses to Q1-Q15
          responses: results.responses, // All responses including course/year
          formVersion: 'v2'
        };
        
        console.log('📤 Sending data to API:', questionData);
        console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
        
        try {
          const response = await apiPost('/questions', questionData, token);
          console.log('✅ Assessment saved successfully', response);
          const responseData = response as any;
          alert(`✅ Assessment saved! ID: ${responseData.id}, Risk Level: ${responseData.riskLevel}`);
        } catch (apiError: any) {
          console.error('❌ API call failed:', apiError);
          console.error('❌ Error details:', apiError.message);
          alert(`❌ Failed to save assessment: ${apiError.message}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error saving assessment:', error);
      console.error('❌ Error details:', error.message);
      alert(`❌ Error: ${error.message}`);
    }
    
    setAssessmentResults(results);
    setCurrentState('results');
  };

  const handleResourceSelect = (resource: string) => {
    switch (resource) {
      case 'mindfulness-videos':
      case 'self-care-articles':
        setCurrentState('resources');
        break;
      case 'peer-support':
      case 'peer-chat':
        setCurrentState('peer-support');
        break;
      case 'counselor-booking':
        setCurrentState('counselor-booking');
        break;
      case 'crisis-support':
        // In a real app, this would redirect to crisis resources
        window.open('tel:988', '_self');
        break;
      default:
        setCurrentState('resources');
    }
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
    setAssessmentResults(null);
  };

  const handleBackToResults = () => {
    setCurrentState('results');
  };

  const handleBookCounselor = () => {
    setCurrentState('counselor-booking');
  };

  const handleLogout = () => {
    logout();
  };

  // Render current state
  switch (currentState) {
    case 'welcome':
      return (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <WelcomeHero onStartScreening={handleStartScreening} />
        </div>
      );
    
    case 'screening':
      return (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <ChatbotScreening 
            onComplete={handleScreeningComplete}
            onBack={handleBackToWelcome}
          />
        </div>
      );
    
    case 'results':
      return assessmentResults ? (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <RiskAssessmentResults 
            results={assessmentResults}
            onResourceSelect={handleResourceSelect}
          />
        </div>
      ) : (
        <WelcomeHero onStartScreening={handleStartScreening} />
      );
    
    case 'resources':
      return (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <ResourceHub 
            onBack={handleBackToResults}
            initialFilter="all"
          />
        </div>
      );
    
    case 'peer-support':
      return (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <PeerSupportCommunity 
            onBack={handleBackToResults}
            onBookCounselor={handleBookCounselor}
          />
        </div>
      );
    
    case 'counselor-booking':
      return (
        <div>
          {/* Header with Logout */}
          <header className="fixed top-0 right-0 z-50 p-4">
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
          <CounselorBooking 
            onBack={handleBackToResults}
          />
        </div>
      );
    
    default:
      return <WelcomeHero onStartScreening={handleStartScreening} />;
  }
};

export default Index;

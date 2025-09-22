import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiskAssessmentResults } from "@/components/RiskAssessmentResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Play, BookOpen, X, ExternalLink, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AssessmentResults {
  course: string;
  year: string;
  answers: Record<string, string>;
  responses: Record<string, string>;
}

interface VideoResource {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  category: string;
}

interface ArticleResource {
  id: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  content: string;
}

export default function PreviousResults() {
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<'videos' | 'articles' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Mindfulness and motivation videos
  const mindfulnessVideos: VideoResource[] = [
    {
      id: '1',
      title: '5 Minute Meditation - Guided Breathing',
      description: 'A simple 5-minute guided meditation perfect for beginners and busy students.',
      duration: '5:03',
      thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=inpok4MKVLM',
      category: 'Meditation'
    },
    {
      id: '2',
      title: 'Student Motivation - Never Give Up',
      description: 'Powerful motivational video to inspire students to keep pushing forward.',
      duration: '3:47',
      thumbnail: 'https://img.youtube.com/vi/mgmVOuLgFB0/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=mgmVOuLgFB0',
      category: 'Motivation'
    },
    {
      id: '3',
      title: '4-7-8 Breathing Technique for Anxiety',
      description: 'Learn the 4-7-8 breathing technique to quickly reduce anxiety and stress.',
      duration: '2:17',
      thumbnail: 'https://img.youtube.com/vi/YRPh_GaiL8s/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=YRPh_GaiL8s',
      category: 'Breathing'
    },
    {
      id: '4',
      title: 'Study Hard - Motivational Video',
      description: 'Inspirational content to help students stay focused and motivated in their studies.',
      duration: '4:32',
      thumbnail: 'https://img.youtube.com/vi/lsSC2vx7zFQ/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=lsSC2vx7zFQ',
      category: 'Motivation'
    },
    {
      id: '5',
      title: '10 Minute Mindfulness Meditation',
      description: 'A longer mindfulness practice for deeper relaxation and stress relief.',
      duration: '10:03',
      thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=ZToicYcHIOU',
      category: 'Meditation'
    },
    {
      id: '6',
      title: 'Morning Motivation for Students',
      description: 'Start your day with positive energy and the right mindset for success.',
      duration: '5:21',
      thumbnail: 'https://img.youtube.com/vi/ji5_MqicxSo/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=ji5_MqicxSo',
      category: 'Motivation'
    }
  ];

  // Self-care articles and resources
  const selfCareArticles: ArticleResource[] = [
    {
      id: '1',
      title: 'Managing Academic Stress: A Student\'s Guide',
      description: 'Practical strategies for handling college workload and academic pressure.',
      readTime: '7 min read',
      category: 'Academic Wellness',
      content: 'Learn effective time management, study techniques, and stress-reduction methods specifically designed for students.'
    },
    {
      id: '2',
      title: 'Building Healthy Sleep Habits',
      description: 'The importance of sleep for mental health and academic performance.',
      readTime: '5 min read',
      category: 'Sleep Health',
      content: 'Discover how proper sleep hygiene can improve your mood, memory, and overall wellbeing.'
    },
    {
      id: '3',
      title: 'Social Connection and Mental Health',
      description: 'How to maintain meaningful relationships while managing your studies.',
      readTime: '6 min read',
      category: 'Social Wellness',
      content: 'Tips for building and maintaining supportive relationships that enhance your mental health.'
    },
    {
      id: '4',
      title: 'Nutrition for Mental Clarity',
      description: 'Foods that support brain function and emotional wellbeing.',
      readTime: '8 min read',
      category: 'Nutrition',
      content: 'Learn about brain-boosting foods and how proper nutrition affects your mental health.'
    },
    {
      id: '5',
      title: 'Exercise and Mental Health',
      description: 'The powerful connection between physical activity and emotional wellbeing.',
      readTime: '6 min read',
      category: 'Physical Wellness',
      content: 'Discover how regular exercise can reduce anxiety, depression, and improve your mood.'
    },
    {
      id: '6',
      title: 'Mindfulness in Daily Life',
      description: 'Simple ways to incorporate mindfulness into your busy student schedule.',
      readTime: '5 min read',
      category: 'Mindfulness',
      content: 'Practical mindfulness techniques you can use between classes and during study breaks.'
    }
  ];

  useEffect(() => {
    // Get results data from navigation state
    const stateData = location.state?.results;
    if (stateData) {
      setResults(stateData);
      setLoading(false);
    } else {
      // If no results data provided, redirect back to main page
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const handleResourceSelect = (resource: string) => {
    switch (resource) {
      case 'mindfulness-videos':
        setSelectedResourceType('videos');
        setShowResourceModal(true);
        break;
      case 'self-care-articles':
        setSelectedResourceType('articles');
        setShowResourceModal(true);
        break;
      case 'peer-support':
      case 'peer-chat':
        // For now, you can implement navigation to peer support
        alert(`Opening ${resource} - Feature coming soon!`);
        break;
      case 'counselor-booking':
        // For now, you can implement navigation to counselor booking
        alert(`Opening ${resource} - Feature coming soon!`);
        break;
      case 'crisis-support':
        // In a real app, this would redirect to crisis resources
        window.open('tel:988', '_self');
        break;
      default:
        alert(`Opening ${resource} - Feature coming soon!`);
    }
  };

  const handleVideoClick = (video: VideoResource) => {
    window.open(video.url, '_blank');
  };

  const handleArticleClick = (article: ArticleResource) => {
    // In a real app, this would navigate to a detailed article page
    alert(`Opening "${article.title}" - ${article.description}`);
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setSelectedResourceType(null);
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

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find your previous assessment results.</p>
            <Button onClick={() => navigate('/signin')}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logout */}
      <header className="flex justify-end items-center p-4 bg-background border-b">
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

      {/* Results Content */}
      <div className="pt-4">
        <RiskAssessmentResults 
          results={results}
          onResourceSelect={handleResourceSelect}
        />
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-card/50">
              <div className="flex items-center gap-3">
                {selectedResourceType === 'videos' ? (
                  <Play className="w-6 h-6 text-primary" />
                ) : (
                  <BookOpen className="w-6 h-6 text-primary" />
                )}
                <h2 className="text-2xl font-bold">
                  {selectedResourceType === 'videos' ? 'Mindfulness & Motivation Videos' : 'Self-Care Resources'}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={closeResourceModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedResourceType === 'videos' ? (
                <div className="space-y-6">
                  <p className="text-muted-foreground mb-6">
                    Watch these carefully curated videos to help with mindfulness, motivation, and stress relief.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mindfulnessVideos.map(video => (
                      <Card 
                        key={video.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-t-lg" />
                          <div className="absolute top-4 left-4">
                            <div className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                              {video.category}
                            </div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute bottom-4 right-4">
                            <div className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                              {video.duration}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {video.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground mb-6">
                    Explore these comprehensive self-care resources to support your mental health and wellbeing.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selfCareArticles.map(article => (
                      <Card 
                        key={article.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                        onClick={() => handleArticleClick(article)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full w-fit mb-3">
                                {article.category}
                              </div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {article.title}
                              </CardTitle>
                            </div>
                            <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4">
                            {article.description}
                          </p>
                          <p className="text-muted-foreground text-sm mb-4">
                            {article.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {article.readTime}
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary">
                              Read More →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-card/50 flex justify-end">
              <Button onClick={closeResourceModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
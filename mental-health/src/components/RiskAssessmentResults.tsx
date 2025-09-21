import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, MessageSquare, Play, Shield, Users } from "lucide-react";
import mindfulnessImage from "@/assets/mindfulness-resources.jpg";
import peerSupportImage from "@/assets/peer-support.jpg";

interface RiskAssessmentResultsProps {
  scores: { phq9: number; gad7: number };
  onResourceSelect: (resource: string) => void;
}

type RiskLevel = 'low' | 'medium' | 'high';

const getRiskLevel = (phq9: number, gad7: number): RiskLevel => {
  if (phq9 >= 15 || gad7 >= 15) return 'high';
  if (phq9 >= 5 || gad7 >= 5) return 'medium';
  return 'low';
};

const getRiskConfig = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return {
        title: 'Low Risk',
        description: 'You seem to be managing well overall. Keep up the good work with self-care!',
        color: 'risk-low',
        icon: Shield,
        recommendations: [
          {
            title: 'Mindfulness & Meditation',
            description: 'Guided meditation and breathing exercises to maintain your wellbeing',
            action: 'Watch Videos',
            icon: Play,
            resource: 'mindfulness-videos'
          },
          {
            title: 'Self-Care Resources',
            description: 'Articles and tips for maintaining good mental health habits',
            action: 'Browse Resources',
            icon: BookOpen,
            resource: 'self-care-articles'
          }
        ]
      };
    case 'medium':
      return {
        title: 'Medium Risk',
        description: 'You might benefit from additional support. Consider connecting with peers or exploring resources.',
        color: 'risk-medium',
        icon: Users,
        recommendations: [
          {
            title: 'Peer Support Groups',
            description: 'Connect with other students who understand what you\'re going through',
            action: 'Join Community',
            icon: Users,
            resource: 'peer-support'
          },
          {
            title: 'Chat with Peer Listeners',
            description: 'Have a confidential conversation with a trained peer supporter',
            action: 'Start Chat',
            icon: MessageSquare,
            resource: 'peer-chat'
          }
        ]
      };
    case 'high':
      return {
        title: 'High Risk',
        description: 'It looks like you could really benefit from professional support. Please consider booking with a counselor.',
        color: 'risk-high',
        icon: Calendar,
        recommendations: [
          {
            title: 'Professional Counseling',
            description: 'Schedule an appointment with a licensed mental health professional',
            action: 'Book Appointment',
            icon: Calendar,
            resource: 'counselor-booking'
          },
          {
            title: 'Crisis Support',
            description: 'Immediate help is available 24/7 if you need it',
            action: 'Get Help Now',
            icon: Shield,
            resource: 'crisis-support'
          }
        ]
      };
  }
};

export const RiskAssessmentResults = ({ scores, onResourceSelect }: RiskAssessmentResultsProps) => {
  const riskLevel = getRiskLevel(scores.phq9, scores.gad7);
  const config = getRiskConfig(riskLevel);
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Your Wellness Assessment
            </h1>
          </div>
          
          <Card className="max-w-2xl mx-auto p-6 mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${config.color}`}>
              <IconComponent className="w-5 h-5" />
              <span className="font-semibold">{config.title}</span>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {config.description}
            </p>
            
            <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold text-foreground">{scores.phq9}/27</div>
                <div>Depression Scale</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{scores.gad7}/21</div>
                <div>Anxiety Scale</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-6 text-center">
            Personalized Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.recommendations.map((rec, index) => (
              <Card key={index} className="wellness-card group cursor-pointer" onClick={() => onResourceSelect(rec.resource)}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                    <rec.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {rec.description}
                    </p>
                    
                    <Button className="group-hover:shadow-comfort" variant="wellness">
                      {rec.action}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
                
                {/* Visual Elements */}
                {rec.resource === 'mindfulness-videos' && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img 
                      src={mindfulnessImage} 
                      alt="Mindfulness resources" 
                      className="w-full h-32 object-cover opacity-60"
                    />
                  </div>
                )}
                
                {rec.resource === 'peer-support' && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img 
                      src={peerSupportImage} 
                      alt="Peer support community" 
                      className="w-full h-32 object-cover opacity-60"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Support */}
        {riskLevel === 'high' && (
          <Card className="bg-destructive/5 border-destructive/20 p-6 text-center animate-gentle-fade">
            <div className="max-w-2xl mx-auto">
              <Shield className="w-8 h-8 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-muted-foreground mb-4">
                If you're having thoughts of self-harm or suicide, please reach out for immediate support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="emergency">
                  Call Crisis Hotline: 988
                </Button>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Text "HOME" to 741741
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Privacy Notice */}
        <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            🔒 Your responses are completely confidential and help us provide you with the most relevant support.
          </p>
        </div>
      </div>
    </div>
  );
};
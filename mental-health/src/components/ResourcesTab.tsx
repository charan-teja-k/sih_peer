import { ArrowLeft, Phone, Wind, BookOpen, Brain, Heart, Smartphone, Building, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourcesTabProps {
  onBack: () => void;
}

const ResourcesTab = ({ onBack }: ResourcesTabProps) => {
  const crisisResources = [
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
      available: "Available 24/7"
    },
    {
      name: "National Suicide Prevention Lifeline", 
      contact: "988",
      description: "Free, confidential crisis support",
      available: "Available 24/7"
    },
    {
      name: "Campus Counseling Center",
      contact: "(555) 123-HELP",
      description: "Professional counseling services for students",
      available: "Mon-Fri 8AM-6PM"
    }
  ];

  const selfCareActivities = [
    {
      title: "5-Minute Breathing Exercise",
      description: "Simple breathing technique to reduce anxiety",
      icon: Wind,
      time: "5 min",
      category: "Breathing"
    },
    {
      title: "Gratitude Journaling", 
      description: "Write 3 things you're grateful for today",
      icon: BookOpen,
      time: "10 min",
      category: "Mindfulness"
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Relax your body by tensing and releasing muscles",
      icon: Brain,
      time: "15 min", 
      category: "Relaxation"
    },
    {
      title: "Mindful Walking",
      description: "Take a slow, mindful walk focusing on your surroundings",
      icon: Heart,
      time: "20 min",
      category: "Movement"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-foreground text-xl">Mental Health Resources</h1>
            <p className="text-sm text-muted-foreground">Support tools and helpful contacts</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Crisis Support */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Phone className="h-5 w-5 mr-2 text-destructive" />
            Crisis Support
          </h2>
          <div className="grid gap-4">
            {crisisResources.map((resource, index) => (
              <div key={index} className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-success rounded-full mr-2" />
                    <span className="text-xs text-success font-medium">{resource.available}</span>
                  </div>
                </div>
                <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  {resource.contact}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Care Activities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Heart className="h-5 w-5 mr-2 text-accent" />
            Self-Care Activities
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {selfCareActivities.map((activity, index) => (
              <div key={index} className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-xl flex items-center justify-center">
                    <activity.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{activity.title}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                    <span className="inline-block px-2 py-1 bg-accent-soft text-accent text-xs rounded-full font-medium">
                      {activity.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Users className="h-5 w-5 mr-2 text-secondary" />
            Additional Resources
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Mental Health Apps
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Headspace - Meditation & mindfulness</span>
                  <span className="text-xs bg-success-soft text-success px-2 py-1 rounded-full">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Calm - Sleep stories & relaxation</span>
                  <span className="text-xs bg-warning-soft text-warning px-2 py-1 rounded-full">Free/Premium</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Sanvello - Anxiety & mood tracking</span>
                  <span className="text-xs bg-success-soft text-success px-2 py-1 rounded-full">Free</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Campus Resources
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Student Health Services</p>
                <p>• Academic Support Center</p>
                <p>• Disability Resource Center</p>
                <p>• Financial Aid Office</p>
                <p>• Career Counseling Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50">
          <p className="font-semibold text-foreground mb-4">Remember:</p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">It's okay to not be okay. Seeking help is a sign of strength.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Small steps towards self-care can make a big difference.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">You're not alone - support is available when you need it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
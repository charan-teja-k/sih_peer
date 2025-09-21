import { Users, MessageCircle, BookOpen, Settings, UserCheck, Circle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  username: string;
  onJoinGroupChat: () => void;
  onStart1on1Chat: () => void;
  onViewResources: () => void;
  onBookCounselor?: () => void;
  onVolunteerDashboard?: () => void;
  isVolunteer?: boolean;
}

const Dashboard = ({ 
  username, 
  onJoinGroupChat, 
  onStart1on1Chat, 
  onViewResources,
  onBookCounselor,
  onVolunteerDashboard,
  isVolunteer = false 
}: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-foreground">Welcome, {username}</h1>
              <Badge variant="secondary" className="text-xs">
                {isVolunteer ? "Peer Volunteer" : "Anonymous User"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-2 py-8">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            You're in a safe space
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect with peers who understand. Share, listen, and support each other.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group">
            <div 
              onClick={onJoinGroupChat}
              className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-soft rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Join Group Chat</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with 3-5 peers and a volunteer in a supportive group setting
                  </p>
                  <div className="flex items-center text-xs text-success font-medium">
                    <Circle className="h-2 w-2 fill-current mr-1" />
                    2 active rooms available
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <div 
              onClick={onStart1on1Chat}
              className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary-soft rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">1-on-1 with Volunteer</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Private conversation with a trained peer volunteer
                  </p>
                  <div className="flex items-center text-xs text-success font-medium">
                    <Circle className="h-2 w-2 fill-current mr-1" />
                    3 volunteers online
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources & Support */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group">
            <div 
              onClick={onViewResources}
              className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.01] flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent-soft rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mental Health Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Self-care tips, breathing exercises, and helpful resources
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                Explore
              </Button>
            </div>
          </div>

          {onBookCounselor && (
            <div className="group">
              <div 
                onClick={onBookCounselor}
                className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.01] flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Book Professional Counselor</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule with licensed therapists and psychologists
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  Book Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Volunteer Dashboard Access */}
        {isVolunteer && (
          <div className="group">
            <div 
              onClick={onVolunteerDashboard}
              className="bg-card rounded-2xl p-4 shadow-gentle border border-warning/20 hover:shadow-comfort transition-all duration-300 cursor-pointer hover:scale-[1.01] flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-warning-soft rounded-xl flex items-center justify-center group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Volunteer Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your volunteer activities and view requests
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="text-warning hover:text-warning/80">
                Open Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
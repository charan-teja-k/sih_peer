import { ArrowLeft, MessageCircle, Users, Clock, AlertTriangle, CheckCircle, Phone, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VolunteerDashboardProps {
  username: string;
  onBack: () => void;
}

const VolunteerDashboard = ({ username, onBack }: VolunteerDashboardProps) => {
  const activeRequests = [
    {
      id: "1",
      type: "1-on-1",
      username: "AnxiousStudent23",
      waitTime: "2 min",
      severity: "medium",
      message: "Feeling overwhelmed with coursework and need someone to talk to"
    },
    {
      id: "2", 
      type: "group",
      roomName: "Study Stress Support",
      members: 3,
      waitTime: "5 min",
      severity: "low",
      message: "Group discussing exam anxiety"
    }
  ];

  const currentChats = [
    {
      id: "1",
      username: "QuietMind45",
      type: "1-on-1",
      duration: "15 min",
      lastMessage: "Thank you for listening, I feel much better now"
    },
    {
      id: "2",
      roomName: "Peer Support Circle",
      type: "group", 
      members: 4,
      duration: "8 min",
      lastMessage: "That's a really helpful perspective"
    }
  ];

  const todayStats = {
    sessionsCompleted: 3,
    studentsHelped: 7,
    averageSessionTime: "18 min",
    escalations: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-semibold text-foreground text-xl">Volunteer Dashboard</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full mr-1" />
                  {username}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Manage your support activities</p>
            </div>
          </div>
          <Badge className="bg-success text-success-foreground">
            <div className="w-2 h-2 bg-success-foreground rounded-full mr-1" />
            Online
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{todayStats.sessionsCompleted}</p>
            <p className="text-sm text-muted-foreground">Sessions Today</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 text-center">
            <p className="text-2xl font-bold text-secondary">{todayStats.studentsHelped}</p>
            <p className="text-sm text-muted-foreground">Students Helped</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 text-center">
            <p className="text-2xl font-bold text-accent">{todayStats.averageSessionTime}</p>
            <p className="text-sm text-muted-foreground">Avg. Session</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 text-center">
            <p className="text-2xl font-bold text-success">{todayStats.escalations}</p>
            <p className="text-sm text-muted-foreground">Escalations</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Incoming Requests
              </h2>
              <Badge variant="outline">{activeRequests.length} pending</Badge>
            </div>
            
            <div className="space-y-3">
              {activeRequests.map((request) => (
                <div key={request.id} className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-warning-soft rounded-xl flex items-center justify-center">
                        {request.type === '1-on-1' ? (
                          <MessageCircle className="h-5 w-5 text-warning" />
                        ) : (
                          <Users className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {request.type === '1-on-1' ? request.username : request.roomName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.type === '1-on-1' ? '1-on-1 Chat' : `Group Chat • ${request.members} members`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={`${
                        request.severity === 'high' ? 'bg-destructive' :
                        request.severity === 'medium' ? 'bg-warning' : 'bg-success'
                      } text-white`}>
                        {request.severity}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.waitTime}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic pl-13">
                    "{request.message}"
                  </p>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Accept Request
                    </Button>
                    <Button size="sm" variant="outline">
                      Pass
                    </Button>
                  </div>
                </div>
              ))}
              
              {activeRequests.length === 0 && (
                <div className="bg-card rounded-2xl p-8 shadow-gentle border border-border/50 text-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-medium">No incoming requests at the moment</p>
                  <p className="text-sm text-muted-foreground">You'll be notified when students need support</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Chats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Active Chats
              </h2>
              <Badge variant="outline">{currentChats.length} active</Badge>
            </div>
            
            <div className="space-y-3">
              {currentChats.map((chat) => (
                <div key={chat.id} className="bg-card rounded-2xl p-4 shadow-gentle border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center">
                        {chat.type === '1-on-1' ? (
                          <MessageCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {chat.type === '1-on-1' ? chat.username : chat.roomName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {chat.type === '1-on-1' ? '1-on-1 Chat' : `Group Chat • ${chat.members} members`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-success">
                      <div className="w-2 h-2 bg-success rounded-full mr-1" />
                      {chat.duration}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic pl-13">
                    Last: "{chat.lastMessage}"
                  </p>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                      Continue Chat
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      Escalate
                    </Button>
                  </div>
                </div>
              ))}
              
              {currentChats.length === 0 && (
                <div className="bg-card rounded-2xl p-8 shadow-gentle border border-border/50 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-medium">No active chats</p>
                  <p className="text-sm text-muted-foreground">Accept incoming requests to start helping students</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Report Incident</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Coffee className="h-5 w-5" />
              <span className="text-xs">Break Status</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Users className="h-5 w-5" />
              <span className="text-xs">Join Group Chat</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Training Resources</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
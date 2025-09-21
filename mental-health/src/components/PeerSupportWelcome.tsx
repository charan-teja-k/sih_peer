import { Shield, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeerSupportWelcomeProps {
  onJoinAnonymously: () => void;
}

const PeerSupportWelcome = ({ onJoinAnonymously }: PeerSupportWelcomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-gentle">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Peer Support Platform
          </h1>
          <p className="text-muted-foreground font-medium">
            Anonymous • Safe • Supportive
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">Your identity stays completely private</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-secondary-soft rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">Connect with trained peer volunteers</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-accent-soft rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">Share feelings in a judgment-free space</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onJoinAnonymously}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium shadow-gentle hover:shadow-comfort transition-all duration-300"
        >
          Join Anonymously
          <Users className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          You can leave anytime. No personal information required.
        </p>
      </div>
    </div>
  );
};

export default PeerSupportWelcome;
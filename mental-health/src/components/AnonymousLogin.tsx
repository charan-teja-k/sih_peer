import { useState, useEffect } from "react";
import { Shuffle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnonymousLoginProps {
  onUsernameGenerated: (username: string) => void;
}

const usernameOptions = [
  "SkyRider23", "Sunflower92", "OceanBreeze", "MountainPeak", 
  "StarGazer41", "CloudWalker", "RiverFlow88", "ForestWhisper",
  "LunarEcho", "SolarFlare15", "CrystalWave", "ThunderSky",
  "PeacefulMind", "BrightPath", "QuietStrength", "GentleWind",
  "WarmLight", "CalmWater", "SoftRain", "GoldenHeart"
];

const AnonymousLogin = ({ onUsernameGenerated }: AnonymousLoginProps) => {
  const [currentUsername, setCurrentUsername] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateUsername = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * usernameOptions.length);
      const randomNumber = Math.floor(Math.random() * 1000);
      const username = usernameOptions[randomIndex] + randomNumber;
      setCurrentUsername(username);
      setIsGenerating(false);
    }, 800);
  };

  useEffect(() => {
    generateUsername();
  }, []);

  const handleContinue = () => {
    onUsernameGenerated(currentUsername);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-gentle">
            <User className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Your Anonymous Identity
          </h1>
          <p className="text-muted-foreground">
            We've generated a random username for you
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50 text-center space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Your username:</p>
            <p className="text-2xl font-display font-semibold text-primary">
              {isGenerating ? "Generating..." : currentUsername}
            </p>
          </div>

          <Button 
            onClick={generateUsername}
            variant="outline"
            className="w-full py-3 border-primary/20 hover:bg-primary-soft hover:border-primary/40 transition-all duration-300"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Generate New
          </Button>
        </div>

        <Button 
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium shadow-gentle hover:shadow-comfort transition-all duration-300"
        >
          Continue as {currentUsername}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          This username is not stored or linked to any personal information
        </p>
      </div>
    </div>
  );
};

export default AnonymousLogin;
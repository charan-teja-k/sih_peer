import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroWellnessImage from "@/assets/hero-wellness.jpg";

interface WelcomeHeroProps {
  onStartScreening: () => void;
}

export const WelcomeHero = ({ onStartScreening }: WelcomeHeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroWellnessImage}
          alt="Calming wellness background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="wellness-card bg-card/90 backdrop-blur-sm max-w-3xl mx-auto animate-gentle-fade">
          {/* Logo/Brand Area */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                MindSpace
              </h1>
            </div>
            <p className="text-xl text-muted-foreground font-medium">
              Your compassionate AI mental health companion
            </p>
          </div>

          {/* Value Proposition */}
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
              Get personalized support in just 5 minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Take a confidential wellness check to receive tailored resources, connect with peer support, 
              or get matched with a counselor. Your mental health journey starts here.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Shield className="w-6 h-6 text-success" />
              <span className="text-foreground font-medium">100% Confidential</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-foreground font-medium">Evidence-Based</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <Users className="w-6 h-6 text-accent" />
              <span className="text-foreground font-medium">Peer Community</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={onStartScreening}
              variant="wellness"
              size="xl"
              className="group"
            >
              Start Your Wellness Check
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Free • Anonymous • Takes less than 5 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-peaceful-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-peaceful-pulse" />
    </div>
  );
};
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Star, Award, ArrowLeft, CheckCircle, User, Calendar as CalendarLucide, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CounselorBookingProps {
  onBack: () => void;
}

interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  experience: string;
  image: string;
  bio: string;
  sessionTypes: ('video' | 'audio' | 'chat')[];
  nextAvailable: string;
  rate: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const counselors: Counselor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist", 
    specialties: ["Anxiety", "Depression", "Academic Stress"],
    rating: 4.9,
    experience: "8 years",
    image: "👩‍⚕️",
    bio: "Specializing in cognitive behavioral therapy for college students. I help navigate academic stress, social anxiety, and life transitions.",
    sessionTypes: ['video', 'audio', 'chat'],
    nextAvailable: "Today",
    rate: 120
  },
  {
    id: "2", 
    name: "Dr. Michael Rodriguez",
    title: "Licensed Therapist",
    specialties: ["Trauma", "PTSD", "Crisis Support"],
    rating: 4.8,
    experience: "12 years", 
    image: "👨‍⚕️",
    bio: "Experienced in trauma-informed care and crisis intervention. I provide a safe space for healing and growth.",
    sessionTypes: ['video', 'audio'],
    nextAvailable: "Tomorrow", 
    rate: 140
  },
  {
    id: "3",
    name: "Dr. Emily Johnson", 
    title: "Psychiatrist",
    specialties: ["Medication Management", "Bipolar", "ADHD"],
    rating: 4.9,
    experience: "15 years",
    image: "👩‍⚕️", 
    bio: "Focused on holistic mental health including medication management and therapeutic interventions.",
    sessionTypes: ['video'],
    nextAvailable: "This week",
    rate: 180
  }
];

const timeSlots: TimeSlot[] = [
  { time: "9:00 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "11:00 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "1:00 PM", available: false },
  { time: "2:00 PM", available: true },
  { time: "3:00 PM", available: true },
  { time: "4:00 PM", available: false },
  { time: "5:00 PM", available: true },
];

type BookingStep = 'counselors' | 'schedule' | 'confirmation';

const CounselorBooking = ({ onBack }: CounselorBookingProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('counselors');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');

  const handleCounselorSelect = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setSessionType(counselor.sessionTypes[0]);
    setCurrentStep('schedule');
  };

  const handleBooking = () => {
    setCurrentStep('confirmation');
  };

  const renderCounselors = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Professional Counselors</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect with licensed mental health professionals for personalized support and therapy
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {counselors.map((counselor) => (
          <Card key={counselor.id} className="group hover:shadow-comfort transition-all duration-300 cursor-pointer" onClick={() => handleCounselorSelect(counselor)}>
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-3">{counselor.image}</div>
              <CardTitle className="text-xl">{counselor.name}</CardTitle>
              <CardDescription className="font-medium">{counselor.title}</CardDescription>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {counselor.rating}
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {counselor.experience}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {counselor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {counselor.bio}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" />
                  <span>Next: {counselor.nextAvailable}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  ${counselor.rate}/session
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {counselor.sessionTypes.includes('video') && (
                  <Badge variant="outline" className="text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
                {counselor.sessionTypes.includes('audio') && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Audio
                  </Badge>
                )}
                {counselor.sessionTypes.includes('chat') && (
                  <Badge variant="outline" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderScheduling = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('counselors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Counselors
        </Button>
      </div>

      {selectedCounselor && (
        <>
          <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl">{selectedCounselor.image}</div>
              <div>
                <h2 className="text-xl font-semibold">{selectedCounselor.name}</h2>
                <p className="text-muted-foreground">{selectedCounselor.title}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {selectedCounselor.rating}
                  </div>
                  <span className="text-sm text-muted-foreground">${selectedCounselor.rate}/session</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  className={cn("rounded-md border pointer-events-auto")}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Session Type</h3>
                <div className="grid gap-3">
                  {selectedCounselor.sessionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-xl border transition-all",
                        sessionType === type 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-border/80"
                      )}
                    >
                      {type === 'video' && <Video className="h-5 w-5" />}
                      {type === 'audio' && <Clock className="h-5 w-5" />}
                      {type === 'chat' && <MessageSquare className="h-5 w-5" />}
                      <span className="font-medium capitalize">{type} Session</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Available Times - {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <div className="grid gap-2 grid-cols-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium transition-all",
                          selectedTime === slot.time 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : slot.available
                              ? "border-border hover:border-primary/50 hover:bg-primary/5"
                              : "border-border/50 text-muted-foreground bg-muted/30 cursor-not-allowed"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <Button 
                  onClick={handleBooking}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-lg font-semibold shadow-gentle"
                >
                  Book Appointment
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Appointment Booked!</h1>
        <p className="text-muted-foreground">
          Your counseling session has been successfully scheduled.
        </p>
      </div>

      {selectedCounselor && selectedDate && selectedTime && (
        <div className="bg-card rounded-2xl p-6 shadow-gentle border border-border/50 space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-4xl">{selectedCounselor.image}</div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{selectedCounselor.name}</h3>
              <p className="text-muted-foreground">{selectedCounselor.title}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarLucide className="h-4 w-4 text-muted-foreground" />
                <span>Date</span>
              </div>
              <span className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Time</span>
              </div>
              <span className="font-medium">{selectedTime}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {sessionType === 'video' && <Video className="h-4 w-4 text-muted-foreground" />}
                {sessionType === 'audio' && <Clock className="h-4 w-4 text-muted-foreground" />}
                {sessionType === 'chat' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                <span>Session Type</span>
              </div>
              <span className="font-medium capitalize">{sessionType}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Cost</span>
              </div>
              <span className="font-medium">${selectedCounselor.rate}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          A confirmation email will be sent to you shortly with session details and preparation instructions.
        </p>
        <p>
          Need to reschedule? Contact us at least 24 hours before your appointment.
        </p>
      </div>

      <Button 
        onClick={onBack}
        variant="outline" 
        className="rounded-xl px-8"
      >
        Return to Dashboard  
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              currentStep === 'counselors' ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "w-2 h-2 rounded-full", 
              currentStep === 'schedule' ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "w-2 h-2 rounded-full",
              currentStep === 'confirmation' ? "bg-primary" : "bg-muted" 
            )} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 py-8">
        {currentStep === 'counselors' && renderCounselors()}
        {currentStep === 'schedule' && renderScheduling()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </div>
    </div>
  );
};

export default CounselorBooking;
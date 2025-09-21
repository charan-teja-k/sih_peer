import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bot, User } from "lucide-react";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  isQuestion?: boolean;
  answers?: Array<{ text: string; value: number }>;
}

interface ChatbotScreeningProps {
  onComplete: (scores: { phq9: number; gad7: number }) => void;
  onBack: () => void;
}

// PHQ-9 Questions
const PHQ9_QUESTIONS = [
  "Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?",
  "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
  "Over the past 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
  "Over the past 2 weeks, how often have you felt tired or had little energy?",
  "Over the past 2 weeks, how often have you had poor appetite or been overeating?",
  "Over the past 2 weeks, how often have you felt bad about yourself or that you are a failure?",
  "Over the past 2 weeks, how often have you had trouble concentrating on things?",
  "Over the past 2 weeks, how often have you moved or spoken slowly, or been fidgety or restless?",
  "Over the past 2 weeks, how often have you had thoughts that you would be better off dead?"
];

// GAD-7 Questions  
const GAD7_QUESTIONS = [
  "Over the past 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
  "Over the past 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
  "Over the past 2 weeks, how often have you been bothered by worrying too much about different things?",
  "Over the past 2 weeks, how often have you been bothered by trouble relaxing?",
  "Over the past 2 weeks, how often have you been bothered by being so restless that it's hard to sit still?",
  "Over the past 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?",
  "Over the past 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?"
];

const ANSWER_OPTIONS = [
  { text: "Not at all", value: 0 },
  { text: "Several days", value: 1 },
  { text: "More than half the days", value: 2 },
  { text: "Nearly every day", value: 3 }
];

export const ChatbotScreening = ({ onComplete, onBack }: ChatbotScreeningProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phq9Scores, setPhq9Scores] = useState<number[]>([]);
  const [gad7Scores, setGad7Scores] = useState<number[]>([]);
  const [isPhq9Phase, setIsPhq9Phase] = useState(true);

  const allQuestions = isPhq9Phase ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const totalQuestions = PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length;
  const currentOverallIndex = isPhq9Phase ? currentQuestionIndex : PHQ9_QUESTIONS.length + currentQuestionIndex;

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: "Hi! I'm here to help you assess your mental wellbeing. I'll ask you some questions about how you've been feeling lately. Your responses are completely confidential and will help me provide you with personalized support."
      },
      {
        id: '2',
        type: 'bot',
        content: "Let's start with the first question:",
        isQuestion: true
      }
    ]);

    // Add first question after a delay
    setTimeout(() => {
      addQuestion();
    }, 1000);
  }, []);

  const addQuestion = () => {
    const question = allQuestions[currentQuestionIndex];
    const questionMessage: Message = {
      id: `question-${currentOverallIndex}`,
      type: 'bot',
      content: question,
      isQuestion: true,
      answers: ANSWER_OPTIONS
    };

    setMessages(prev => [...prev, questionMessage]);
  };

  const handleAnswer = (answer: { text: string; value: number }) => {
    // Add user response
    const userMessage: Message = {
      id: `answer-${currentOverallIndex}`,
      type: 'user',
      content: answer.text
    };

    setMessages(prev => [...prev, userMessage]);

    // Store score
    if (isPhq9Phase) {
      setPhq9Scores(prev => [...prev, answer.value]);
    } else {
      setGad7Scores(prev => [...prev, answer.value]);
    }

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        addQuestion();
      } else if (isPhq9Phase) {
        // Switch to GAD-7
        setIsPhq9Phase(false);
        setCurrentQuestionIndex(0);
        
        const transitionMessage: Message = {
          id: 'transition',
          type: 'bot',
          content: "Great! Now I'd like to ask you about anxiety. These questions will help me better understand your current state."
        };
        
        setMessages(prev => [...prev, transitionMessage]);
        
        setTimeout(() => {
          addQuestion();
        }, 1500);
      } else {
        // Complete screening
        const phq9Total = phq9Scores.reduce((sum, score) => sum + score, 0) + answer.value;
        const gad7Total = gad7Scores.reduce((sum, score) => sum + score, 0) + answer.value;
        
        const completionMessage: Message = {
          id: 'completion',
          type: 'bot',
          content: "Thank you for completing the assessment. I'm now analyzing your responses to provide you with personalized recommendations..."
        };
        
        setMessages(prev => [...prev, completionMessage]);
        
        setTimeout(() => {
          onComplete({ phq9: phq9Total, gad7: gad7Total });
        }, 2000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              Question {currentOverallIndex + 1} of {totalQuestions}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentOverallIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-bubble-in ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              
              <Card className={`max-w-md p-4 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-card mr-12'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.answers && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {message.answers.map((answer, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnswer(answer)}
                        className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 transition-colors"
                      >
                        {answer.text}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>

              {message.type === 'user' && (
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
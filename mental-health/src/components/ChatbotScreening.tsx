import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bot, User } from "lucide-react";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  isQuestion?: boolean;
  answers?: Array<{ text: string; value: string | number }>;
}

interface ChatbotScreeningProps {
  onComplete: (results: { course: string; year: string; answers: Record<string, string>; responses: Record<string, string> }) => void;
  onBack: () => void;
}

// Course options
const COURSE_OPTIONS = [
  { text: "B.Tech", value: "B.Tech" },
  { text: "Degree (BA/BSc/BCom)", value: "Degree (BA/BSc/BCom)" },
  { text: "Diploma", value: "Diploma" },
  { text: "Postgraduate (M.Tech/MBA/MSc etc.)", value: "Postgraduate (M.Tech/MBA/MSc etc.)" },
  { text: "Intermediate", value: "Intermediate" },
  { text: "other", value: "other" }
];

// Year options
const YEAR_OPTIONS = [
  { text: "1st year", value: "1st year" },
  { text: "2nd year", value: "2nd year" },
  { text: "3rd year", value: "3rd year" },
  { text: "4th year", value: "4th year" },
  { text: "Other", value: "Other" }
];

// Updated questions based on your requirements
const SCREENING_QUESTIONS = [
  { 
    question: "Which course are you pursuing?", 
    key: "course", 
    options: COURSE_OPTIONS, 
    type: "course" 
  },
  { 
    question: "Which year of study are you in?", 
    key: "year", 
    options: YEAR_OPTIONS, 
    type: "year" 
  },
  { 
    question: "1. In the last 2 weeks, how often have you felt nervous or anxious?", 
    key: "Q1", 
    type: "mental_health" 
  },
  { 
    question: "2. How often have you felt that you can't stop worrying?", 
    key: "Q2", 
    type: "mental_health" 
  },
  { 
    question: "3. How often have you found it hard to relax?", 
    key: "Q3", 
    type: "mental_health" 
  },
  { 
    question: "4. How often have you felt afraid that something bad might happen?", 
    key: "Q4", 
    type: "mental_health" 
  },
  { 
    question: "5. How often have you lost interest or found no joy in doing things?", 
    key: "Q5", 
    type: "mental_health" 
  },
  { 
    question: "6. How often have you felt sad, down, or hopeless?", 
    key: "Q6", 
    type: "mental_health" 
  },
  { 
    question: "7. How often have you had trouble sleeping (or slept too much)?", 
    key: "Q7", 
    type: "mental_health" 
  },
  { 
    question: "8. How often have you felt tired or low on energy?", 
    key: "Q8", 
    type: "mental_health" 
  },
  { 
    question: "9. How often have you noticed changes in your eating (less or more than usual)?", 
    key: "Q9", 
    type: "mental_health" 
  },
  { 
    question: "10. How often have you had thoughts of killing yourself or thoughts of hurting yourself?", 
    key: "Q10", 
    type: "mental_health" 
  },
  { 
    question: "11. How often have you lost sleep because of worries?", 
    key: "Q11", 
    type: "mental_health" 
  },
  { 
    question: "12. How often have you felt under constant stress or pressure?", 
    key: "Q12", 
    type: "mental_health" 
  },
  { 
    question: "13. How often have you been able to enjoy your daily activities?", 
    key: "Q13", 
    type: "mental_health" 
  },
  { 
    question: "14. How often have you felt unhappy or depressed?", 
    key: "Q14", 
    type: "mental_health" 
  },
  { 
    question: "15. How often have you felt low confidence in yourself?", 
    key: "Q15", 
    type: "mental_health" 
  }
];

const MENTAL_HEALTH_ANSWER_OPTIONS = [
  { text: "Not at all", value: "Not at all" },
  { text: "Sometimes", value: "Sometimes" },
  { text: "Often", value: "Often" },
  { text: "Almost every day", value: "Almost every day" }
];

export const ChatbotScreening = ({ onComplete, onBack }: ChatbotScreeningProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const totalQuestions = SCREENING_QUESTIONS.length;
  const currentQuestion = SCREENING_QUESTIONS[currentQuestionIndex];

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    // Try scrolling the container first
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // Also scroll the target element into view as backup
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }
  };

  // Scroll when messages are added
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 300);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: "Hi! I'm here to help you assess your mental wellbeing and understand your academic background. I'll ask you some questions about your studies and how you've been feeling lately. Your responses are completely confidential and will help me provide you with personalized support."
      },
      {
        id: '2',
        type: 'bot',
        content: "Let's start with some basic information:",
        isQuestion: true
      }
    ]);

    // Add first question after a delay
    setTimeout(() => {
      addQuestion();
    }, 1000);
  }, []);

  // Add question when currentQuestionIndex changes (except for initial load)
  useEffect(() => {
    if (currentQuestionIndex > 0) {
      addQuestion();
    }
  }, [currentQuestionIndex]);

  const addQuestion = () => {
    const question = currentQuestion;
    const questionMessage: Message = {
      id: `question-${currentQuestionIndex}`,
      type: 'bot',
      content: question.question,
      isQuestion: true,
      answers: question.type === 'course' ? COURSE_OPTIONS :
               question.type === 'year' ? YEAR_OPTIONS :
               MENTAL_HEALTH_ANSWER_OPTIONS
    };

    setMessages(prev => [...prev, questionMessage]);
  };

  const handleAnswer = (answer: { text: string; value: string | number }) => {
    // Add user response
    const userMessage: Message = {
      id: `answer-${currentQuestionIndex}`,
      type: 'user',
      content: answer.text
    };

    setMessages(prev => [...prev, userMessage]);

    // Store response
    setResponses(prev => ({
      ...prev,
      [currentQuestion.key]: answer.value
    }));

    // Debug logging
    console.log(`Current question index: ${currentQuestionIndex}`);
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Current question key: ${currentQuestion.key}`);
    console.log(`Is last question? ${currentQuestionIndex >= totalQuestions - 1}`);

    // Scroll after user answer is added with delay for DOM update
    setTimeout(() => {
      scrollToBottom();
    }, 300);

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        console.log('Moving to next question...');
        setCurrentQuestionIndex(prev => prev + 1);
        // addQuestion() will be called automatically by useEffect when currentQuestionIndex changes
      } else {
        console.log('Completing screening...');
        // Complete screening - store all text responses
        const allResponses = {
          ...responses,
          [currentQuestion.key]: answer.value as string
        };

        console.log('All responses:', allResponses);

        // Separate the mental health answers from course/year
        const mentalHealthAnswers = Object.entries(allResponses)
          .filter(([key]) => key.startsWith('Q'))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
        
        console.log('Mental health answers:', mentalHealthAnswers);
        
        const completionMessage: Message = {
          id: 'completion',
          type: 'bot',
          content: "Thank you for completing the assessment. I'm now analyzing your responses to provide you with personalized recommendations..."
        };
        
        setMessages(prev => [...prev, completionMessage]);
        
        setTimeout(() => {
          console.log('Calling onComplete with:', { 
            course: allResponses.course || '',
            year: allResponses.year || '',
            answers: mentalHealthAnswers,
            responses: allResponses // All responses including course/year
          });
          onComplete({ 
            course: allResponses.course || '',
            year: allResponses.year || '',
            answers: mentalHealthAnswers,
            responses: allResponses // All responses including course/year
          });
        }, 2000);
      }
    }, 1000);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto relative pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-bubble-in relative ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              
              <Card className={`max-w-md p-4 relative w-full ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-card mr-12'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.answers && (
                  <div className="grid grid-cols-1 gap-2 mt-4 w-full relative overflow-hidden">
                    {message.answers.map((answer, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnswer(answer)}
                        className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 transition-colors w-full max-w-full relative !static !transform-none"
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
          {/* Scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
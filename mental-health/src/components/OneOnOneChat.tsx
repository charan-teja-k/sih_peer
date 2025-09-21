import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Shield, Phone, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OneOnOneChatProps {
  username: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'volunteer';
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "volunteer",
    content: "Hi there! I'm Sarah, one of the peer volunteers. I'm here to listen and support you. How are you feeling today?",
    timestamp: "3:45 PM"
  },
  {
    id: "2", 
    sender: "user",
    content: "Hi Sarah, thanks for being here. I've been feeling really anxious lately about my future and I'm not sure who to talk to about it.",
    timestamp: "3:47 PM"
  },
  {
    id: "3",
    sender: "volunteer", 
    content: "I really appreciate you sharing that with me. Anxiety about the future is something many students experience. Would you like to tell me more about what specific aspects are worrying you most?",
    timestamp: "3:48 PM"
  }
];

const OneOnOneChat = ({ username, onBack }: OneOnOneChatProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate volunteer response
    setTimeout(() => {
      const responses = [
        "That sounds really challenging. Thank you for trusting me with this.",
        "I hear you, and your feelings are completely valid.",
        "It takes courage to share these thoughts. How long have you been feeling this way?",
        "That makes a lot of sense. Many people in your situation would feel similarly.",
        "I'm glad you reached out. You don't have to go through this alone."
      ];
      
      const volunteerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'volunteer',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, volunteerMessage]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="font-display font-semibold text-foreground">Private Chat</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <Circle className="h-2 w-2 fill-success text-success mr-1" />
                Volunteer: Sarah
              </div>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Shield className="h-3 w-3 mr-1" />
              Online • Private conversation
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 max-w-4xl mx-auto w-full">
        <Alert className="border-primary/20 bg-primary-soft/50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Private & Secure</strong>
            <br />
            This conversation is private between you and the volunteer. No personal information is stored.
          </AlertDescription>
        </Alert>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground text-sm">
                  {message.sender === 'user' ? username : 'Sarah (Volunteer)'}
                </span>
                {message.sender === 'volunteer' && (
                  <span className="px-2 py-1 bg-warning-soft text-warning text-xs rounded-full font-medium">
                    <Circle className="h-2 w-2 fill-current inline mr-1" />
                    Peer Volunteer
                  </span>
                )}
              </div>
            </div>
            <div className={`rounded-2xl p-4 shadow-gentle border ${
              message.sender === 'user' 
                ? 'bg-primary text-primary-foreground border-primary/20 ml-8' 
                : 'bg-card border-border/50 mr-8'
            }`}>
              <p>{message.content}</p>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {message.timestamp}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Crisis Support Notice */}
      <div className="p-4 max-w-4xl mx-auto w-full">
        <Alert className="border-destructive/20 bg-destructive-soft/50">
          <Phone className="h-4 w-4" />
          <AlertDescription>
            In crisis? Contact emergency services or call the crisis helpline: <strong>988</strong>
          </AlertDescription>
        </Alert>
      </div>

      {/* Message Input */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border/50 p-4 space-y-3">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <Input 
            placeholder="Share what's on your mind..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-center text-xs text-muted-foreground max-w-4xl mx-auto">
          Take your time. This is a safe space to express yourself.
        </p>
      </div>
    </div>
  );
};

export default OneOnOneChat;
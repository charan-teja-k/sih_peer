import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users, Circle, UserCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GroupChatProps {
  username: string;
  onBack: () => void;
}

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  isVolunteer?: boolean;
  emoji?: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    username: "PeacefulMind42",
    content: "Hi everyone, I'm feeling a bit overwhelmed with exams coming up. Anyone else feeling the same?",
    timestamp: "2:30 PM",
    isVolunteer: false
  },
  {
    id: "2",
    username: "SupportHelper", 
    content: "Hello PeacefulMind42! Thank you for sharing. Exam stress is very common. Would you like to talk about what's making you feel most overwhelmed?",
    timestamp: "2:32 PM",
    isVolunteer: true
  },
  {
    id: "3",
    username: "StarGazer15",
    content: "I totally get that feeling! I've been having trouble sleeping because of stress too",
    timestamp: "2:33 PM",
    isVolunteer: false,
    emoji: "😟"
  },
  {
    id: "4",
    username: "CalmWater88",
    content: "Same here. What helps me is taking short breaks every hour to breathe deeply",
    timestamp: "2:35 PM",
    isVolunteer: false,
    emoji: "💙"
  }
];

const GroupChat = ({ username, onBack }: GroupChatProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      username,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: selectedEmoji || undefined
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setSelectedEmoji("");
  };

  const emojiOptions = ["😊", "💙", "🤗", "😢", "😰", "💪", "🌟", "❤️"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-display font-semibold text-foreground">Support Circle</h1>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Circle className="h-2 w-2 fill-success text-success mr-1" />
              4 members • 1 volunteer online
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/30 p-3">
        <div className="max-w-4xl mx-auto flex items-center space-x-3 text-sm overflow-x-auto">
          <div className="flex items-center space-x-1 px-3 py-1 bg-warning-soft rounded-full whitespace-nowrap">
            <Circle className="h-2 w-2 fill-warning text-warning" />
            SupportHelper (Volunteer)
          </div>
          <span className="text-muted-foreground">PeacefulMind42</span>
          <span className="text-muted-foreground">StarGazer15</span>
          <span className="text-muted-foreground">CalmWater88</span>
          <span className="font-medium text-primary">{username} (You)</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground text-sm">
                  {message.username}
                  {message.isVolunteer && (
                  <Badge variant="outline" className="ml-2 text-xs border-warning text-warning">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Volunteer
                    </Badge>
                  )}
                </span>
                {message.emoji && (
                  <span className="text-lg">{message.emoji}</span>
                )}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-3 shadow-gentle border border-border/50">
              <p className="text-foreground">{message.content}</p>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {message.timestamp}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border/50 p-4 space-y-3">
        {/* Emoji Selector */}
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              className={`text-lg p-2 rounded-full transition-colors ${
                selectedEmoji === emoji 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedEmoji(selectedEmoji === emoji ? "" : emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <Input 
            placeholder="Share your thoughts with the group..."
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
          <Heart className="h-3 w-3 inline mr-1" />
          Remember to be kind and supportive to each other
        </p>
      </div>
    </div>
  );
};

export default GroupChat;
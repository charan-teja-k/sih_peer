import { useState } from "react";
import PeerSupportWelcome from "@/components/PeerSupportWelcome";
import AnonymousLogin from "@/components/AnonymousLogin";
import Dashboard from "@/components/Dashboard";
import GroupChat from "@/components/GroupChat";
import OneOnOneChat from "@/components/OneOnOneChat";
import ResourcesTab from "@/components/ResourcesTab";
import VolunteerDashboard from "@/components/VolunteerDashboard";

interface PeerSupportCommunityProps {
  onBack: () => void;
  onBookCounselor?: () => void;
}

type PeerSupportState = 'welcome' | 'login' | 'dashboard' | 'group-chat' | 'one-on-one' | 'resources' | 'volunteer-dashboard';

const PeerSupportCommunity = ({ onBack, onBookCounselor }: PeerSupportCommunityProps) => {
  const [currentState, setCurrentState] = useState<PeerSupportState>('welcome');
  const [username, setUsername] = useState('');
  const [isVolunteer] = useState(Math.random() > 0.7);

  const handleJoinAnonymously = () => setCurrentState('login');
  const handleUsernameGenerated = (generatedUsername: string) => {
    setUsername(generatedUsername);
    setCurrentState('dashboard');
  };
  const handleJoinGroupChat = () => setCurrentState('group-chat');
  const handleStart1on1Chat = () => setCurrentState('one-on-one');
  const handleViewResources = () => setCurrentState('resources');
  const handleVolunteerDashboard = () => setCurrentState('volunteer-dashboard');
  const handleBackToDashboard = () => setCurrentState('dashboard');

  switch (currentState) {
    case 'welcome': return <PeerSupportWelcome onJoinAnonymously={handleJoinAnonymously} />;
    case 'login': return <AnonymousLogin onUsernameGenerated={handleUsernameGenerated} />;
    case 'dashboard': return <Dashboard username={username} onJoinGroupChat={handleJoinGroupChat} onStart1on1Chat={handleStart1on1Chat} onViewResources={handleViewResources} onBookCounselor={onBookCounselor} onVolunteerDashboard={handleVolunteerDashboard} isVolunteer={isVolunteer} />;
    case 'group-chat': return <GroupChat username={username} onBack={handleBackToDashboard} />;
    case 'one-on-one': return <OneOnOneChat username={username} onBack={handleBackToDashboard} />;
    case 'resources': return <ResourcesTab onBack={handleBackToDashboard} />;
    case 'volunteer-dashboard': return <VolunteerDashboard username={username} onBack={handleBackToDashboard} />;
    default: return <PeerSupportWelcome onJoinAnonymously={handleJoinAnonymously} />;
  }
};

export default PeerSupportCommunity;
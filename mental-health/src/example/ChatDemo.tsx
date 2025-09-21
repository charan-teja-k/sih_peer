import { useEffect, useState } from 'react';
import { connectChat, disconnectChat } from '../lib/chat';

export default function ChatDemo() {
  const [log, setLog] = useState<string[]>([]);
  
  useEffect(() => {
    const s = connectChat();
    
    function append(...a: any[]) { 
      setLog(prev => [...prev, a.map(x => JSON.stringify(x)).join(' ')]); 
    }
    
    s.on('connect', () => append('connected'));
    s.on('message', (m: any) => append('message', m));
    s.on('disconnect', () => append('disconnected'));
    
    return () => disconnectChat();
  }, []);
  
  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {log.join('\n')}
    </pre>
  );
}
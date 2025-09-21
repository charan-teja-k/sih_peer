import { useState } from 'react';
import { login, register, me, getToken, clearToken } from '../lib/auth';
import { API_URL } from '../lib/api';

export default function AuthDemo() {
  const [email, setEmail] = useState('a@b.com');
  const [password, setPassword] = useState('test123');
  const [output, setOutput] = useState<string>('');

  async function doRegister() {
    setOutput('Registering...');
    try { 
      setOutput(JSON.stringify(await register(email, password), null, 2)); 
    } catch (e: any) { 
      setOutput(e.message); 
    }
  }

  async function doLogin() {
    setOutput('Logging in...');
    try { 
      setOutput(JSON.stringify(await login(email, password), null, 2)); 
    } catch (e: any) { 
      setOutput(e.message); 
    }
  }

  async function doMe() {
    setOutput('Fetching /users/me ...');
    try { 
      setOutput(JSON.stringify(await me(), null, 2)); 
    } catch (e: any) { 
      setOutput(e.message); 
    }
  }

  async function health() {
    try { 
      const r = await fetch(`${API_URL}/health`); 
      setOutput(await r.text()); 
    } catch (e: any) { 
      setOutput(e.message); 
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
      <h3>Auth Demo</h3>
      <input 
        placeholder="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        placeholder="password" 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={doRegister}>Register</button>
        <button onClick={doLogin}>Login</button>
        <button onClick={doMe}>/users/me</button>
        <button onClick={health}>/health</button>
        <button onClick={() => setOutput(getToken() || 'no token')}>Show token</button>
        <button onClick={() => { clearToken(); setOutput('token cleared'); }}>Logout</button>
      </div>
      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        background: '#111', 
        color: '#0f0', 
        padding: 12, 
        borderRadius: 8 
      }}>
        {output}
      </pre>
    </div>
  );
}
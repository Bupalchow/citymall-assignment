import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';
import GlitchText from '../components/GlitchText';
import Button from '../components/Button';
import InputField from '../components/InputField';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await loginUser(username, password);
      
      if (error) {
        throw error;
      }
      
      // Immediately set user in localStorage if not already done in loginUser
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
      }
      
      // Redirect immediately and force a reload to ensure state is updated
      console.log('Login successful, redirecting to dashboard');
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-dark p-4 relative">
      {/* Circuit background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0ibm9uZSIgLz4KPHBhdGggZD0iTTAgMCBMNTAgNTAgTTUwIDAgTDAgNTAiIHN0cm9rZT0iIzA1ZDllOCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+')]"></div>
      </div>
      
      {/* Terminal effect lines */}
      <div className="absolute top-0 left-0 w-full h-8 flex items-center px-4 bg-cyber-darker border-b border-cyber-blue">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-xs text-cyber-blue font-mono opacity-70">[system@terminal] ~ /login</div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-cyber-blue font-mono opacity-50 animate-pulse">
        CONNECTION_SECURE [v3.1.4]
      </div>
      
      <div className="w-full max-w-md terminal-window z-10">
        <div className="relative z-10">
          <GlitchText className="text-3xl font-bold text-center mb-10">
            AUTHENTICATION_TERMINAL
          </GlitchText>
          
          {error && (
            <div className="mb-6 p-3 border border-cyber-pink bg-cyber-pink/10 text-cyber-pink font-mono text-sm">
              <span className="text-cyber-blue mr-2">[ERROR]:</span> {error}
            </div>
          )}
          
          <div className="mb-6 p-3 border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue/80 font-mono text-xs">
            <span className="text-cyber-yellow">[SYSTEM]:</span> Enter credentials to access secure network
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <InputField
              id="username"
              label="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter access code"
            />
            
            <InputField
              id="password"
              type="password"
              label="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter security key"
            />
            
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                INITIATE_LOGIN
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-cyber-blue flex items-center justify-center space-x-2">
            <span className="text-sm opacity-70 font-mono">[ NEW_USER? ]</span>
            <Link to="/register" className="text-cyber-pink hover:text-cyber-yellow underline font-mono text-sm">
              CREATE_ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


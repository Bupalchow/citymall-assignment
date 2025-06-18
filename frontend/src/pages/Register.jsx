import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/auth';
import GlitchText from '../components/GlitchText';
import Button from '../components/Button';
import InputField from '../components/InputField';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await registerUser(username, password);
      
      if (error) {
        throw error;
      }
      
      alert('Registration successful! You can now login.');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-dark p-4 relative">
      {/* Circuit background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0ibm9uZSIgLz4KPHBhdGggZD0iTTAgMCBMNTAgNTAgTTUwIDAgTDAgNTAiIHN0cm9rZT0iI2YxMDU5NiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+')]"></div>
      </div>
      
      {/* Terminal effect lines */}
      <div className="absolute top-0 left-0 w-full h-8 flex items-center px-4 bg-cyber-darker border-b border-cyber-pink">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-xs text-cyber-pink font-mono opacity-70">[system@terminal] ~ /register</div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-xs text-cyber-pink font-mono opacity-50 animate-pulse">
        REGISTERING_NEW_USER [v3.1.4]
      </div>
      
      <div className="w-full max-w-md terminal-window z-10 border-cyber-pink">
        <div className="relative z-10">
          <GlitchText className="text-3xl font-bold text-center mb-10">
            NEW_USER_REGISTRATION
          </GlitchText>
          
          {error && (
            <div className="mb-6 p-3 border border-cyber-pink bg-cyber-pink/10 text-cyber-pink font-mono text-sm">
              <span className="text-cyber-blue mr-2">[ERROR]:</span> {error}
            </div>
          )}
          
          <div className="mb-6 p-3 border border-cyber-pink/30 bg-cyber-pink/5 text-cyber-pink/80 font-mono text-xs">
            <span className="text-cyber-yellow">[SYSTEM]:</span> Creating new system access credentials
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <InputField
              id="username"
              label="CHOOSE_USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Define access identifier"
            />
            
            <InputField
              id="password"
              type="password"
              label="SET_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Define security key"
            />
            
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                CREATE_ACCOUNT
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-cyber-pink flex items-center justify-center space-x-2">
            <span className="text-sm opacity-70 font-mono">[ EXISTING_USER? ]</span>
            <Link to="/login" className="text-cyber-blue hover:text-cyber-yellow underline font-mono text-sm">
              LOGIN_NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


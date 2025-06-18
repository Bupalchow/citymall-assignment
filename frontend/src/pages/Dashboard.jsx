import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../utils/auth';
import GlitchText from '../components/GlitchText';
import Button from '../components/Button';
import CreateMemeForm from '../components/CreateMemeForm';
import MemeList from '../components/MemeList';
import Leaderboard from '../components/Leaderboard';
import CyberPopup from '../components/CyberPopup';
import socketService from '../utils/socketService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [newMeme, setNewMeme] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'create', or 'leaderboard'
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUser(user);
      socketService.connect();
    } else {
      navigate('/login');
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [navigate]);
  
  const handleLogout = () => {
    socketService.disconnect();
    logoutUser();
    navigate('/login');
  };
  
  const handleMemeCreated = (meme) => {
    setNewMeme(meme);
    setActiveTab('browse'); // Switch to browse tab after creation
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
        <div className="text-cyber-blue animate-pulse font-mono">LOADING_USER_DATA...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cyber-dark pb-20">
      {/* Terminal header */}
      <div className="sticky top-0 left-0 w-full h-12 flex items-center px-4 bg-cyber-darker border-b border-cyber-blue z-20">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-xs text-cyber-blue font-mono opacity-70">
          [user@{user.username}] ~ /dashboard
        </div>
        <div className="ml-auto flex items-center">
          <div className="mr-4 text-cyber-yellow font-mono">
            CREDITS: <span className="text-cyber-pink">{user.credits || 500}</span>
          </div>
          <Button 
            onClick={() => setShowLogoutConfirm(true)} 
            variant="secondary"
            className="py-1 px-4 text-sm"
          >
            LOGOUT
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <GlitchText className="text-4xl font-bold mb-4">
            MEME_MARKETPLACE
          </GlitchText>
          <div className="text-cyber-yellow text-xl font-mono mt-4">
            WELCOME <span className="text-cyber-pink">{user.username}</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-cyber-blue mb-8">
          <button
            className={`py-3 px-6 font-mono ${
              activeTab === 'browse' 
                ? 'text-cyber-blue border-b-2 border-cyber-blue' 
                : 'text-gray-500 hover:text-cyber-yellow'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            BROWSE_MEMES
          </button>
          <button
            className={`py-3 px-6 font-mono ${
              activeTab === 'create' 
                ? 'text-cyber-pink border-b-2 border-cyber-pink' 
                : 'text-gray-500 hover:text-cyber-yellow'
            }`}
            onClick={() => setActiveTab('create')}
          >
            CREATE_MEME
          </button>
          <button
            className={`py-3 px-6 font-mono ${
              activeTab === 'leaderboard' 
                ? 'text-cyber-yellow border-b-2 border-cyber-yellow' 
                : 'text-gray-500 hover:text-cyber-yellow'
            }`}
            onClick={() => setActiveTab('leaderboard')}
          >
            LEADERBOARD
          </button>
        </div>
        
        {/* Content */}
        <div>
          {activeTab === 'browse' ? (
            <MemeList newMeme={newMeme} />
          ) : activeTab === 'create' ? (
            <CreateMemeForm onMemeCreated={handleMemeCreated} />
          ) : (
            <Leaderboard />
          )}
        </div>
      </div>
      
      {/* Logout confirmation popup */}
      <CyberPopup
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="CONFIRM_LOGOUT"
        message="Are you sure you want to terminate your session?"
        type="confirm"
        onConfirm={handleLogout}
        confirmText="LOGOUT"
        cancelText="CANCEL"
      />
      
      <div className="fixed bottom-2 left-0 w-full text-center text-xs text-cyber-blue font-mono opacity-50">
        MEME_SYSTEM_v1.0 // ALL TRANSACTIONS RECORDED
      </div>
    </div>
  );
};

export default Dashboard;


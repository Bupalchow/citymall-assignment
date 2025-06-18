import React, { useState, useEffect } from 'react';
import MemeCard from './MemeCard';
import { getAllMemes } from '../services/memeService';
import CyberPopup from './CyberPopup';
import socketService from '../utils/socketService';

const MemeList = ({ newMeme, refreshTrigger }) => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({ title: '', message: '', type: 'info' });
  const [bidActivity, setBidActivity] = useState([]);
  
  useEffect(() => {
    fetchMemes();
    socketService.connect();
    const unsubscribe = socketService.on('bid_update', (data) => {
      setBidActivity(prev => [{
        memeId: data.memeId,
        username: data.username,
        amount: data.amount,
        timestamp: new Date(data.timestamp).toLocaleTimeString()
      }, ...prev].slice(0, 10));
    });
    
    return () => {
      unsubscribe();
    };
  }, [newMeme, refreshTrigger]);
  
  const fetchMemes = async () => {
    setLoading(true);
    const { data, error } = await getAllMemes();
    
    if (error) {
      setPopupInfo({
        title: 'DATA_FETCH_ERROR',
        message: 'Failed to load memes. Please try again later.',
        type: 'error'
      });
      setShowPopup(true);
      setLoading(false);
      return;
    }
    
    setMemes(data);
    setLoading(false);
  };
  
  return (
    <div className="meme-list-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyber-blue font-mono">MEME_GALLERY</h2>
        <button 
          onClick={fetchMemes}
          className="text-cyber-blue hover:text-cyber-yellow font-mono text-sm"
        >
          [REFRESH]
        </button>
      </div>
      
      {bidActivity.length > 0 && (
        <div className="mb-6 border border-cyber-pink bg-cyber-darker p-3">
          <div className="text-cyber-pink font-mono text-sm mb-2">LIVE_BID_ACTIVITY:</div>
          <div className="max-h-24 overflow-y-auto bg-cyber-dark p-2">
            {bidActivity.map((bid, index) => (
              <div key={index} className="text-xs mb-1 font-mono flex justify-between">
                <span>
                  <span className="text-cyber-yellow">{bid.username}</span>
                  <span className="text-gray-400"> bid </span>
                  <span className="text-cyber-pink">{bid.amount} credits</span>
                </span>
                <span className="text-cyber-blue">{bid.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-cyber-blue animate-pulse font-mono">LOADING_CONTENT...</div>
        </div>
      ) : memes.length === 0 ? (
        <div className="terminal-window border-cyber-pink p-6 text-center">
          <p className="text-cyber-pink font-mono">NO_MEMES_FOUND</p>
          <p className="text-cyber-blue text-sm mt-2">Be the first to create a meme!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {memes.map(meme => (
            <MemeCard 
              key={meme.id} 
              meme={meme} 
              onMemeUpdate={fetchMemes} 
              isGridLayout={true}
            />
          ))}
        </div>
      )}
      
      <CyberPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupInfo.title}
        message={popupInfo.message}
        type={popupInfo.type}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .meme-list-container {
            max-width: 1400px;
            margin: 0 auto;
          }
        `
      }} />
    </div>
  );
};

export default MemeList;

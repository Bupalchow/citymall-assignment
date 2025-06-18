import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/memeService';
import CyberPopup from './CyberPopup';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({ title: '', message: '', type: 'info' });
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await getLeaderboard();
    
    if (error) {
      setPopupInfo({
        title: 'DATA_FETCH_ERROR',
        message: 'Failed to load leaderboard. Please try again later.',
        type: 'error'
      });
      setShowPopup(true);
      setLoading(false);
      return;
    }
    
    setLeaderboardData(data);
    setLoading(false);
  };
  
  return (
    <div className="leaderboard-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyber-blue font-mono">MEME_LEADERBOARD</h2>
        <button 
          onClick={fetchLeaderboard}
          className="text-cyber-blue hover:text-cyber-yellow font-mono text-sm"
        >
          [REFRESH]
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-cyber-blue animate-pulse font-mono">CALCULATING_RANKINGS...</div>
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="terminal-window border-cyber-pink p-6 text-center">
          <p className="text-cyber-pink font-mono">NO_MEMES_FOUND</p>
          <p className="text-cyber-blue text-sm mt-2">Be the first to create a meme!</p>
        </div>
      ) : (
        <div className="terminal-window border-cyber-yellow">
          {/* Top 3 Winners - Vertical Column Layout */}
          <div className="p-6 bg-cyber-darker border-b border-cyber-yellow">
            <h3 className="text-xl text-cyber-yellow font-mono mb-4">TOP_MEMES</h3>
            
            {leaderboardData.slice(0, 5).map((meme, index) => (
              <div key={meme.id} 
                className={`mb-6 p-4 border-2 ${index === 0 ? 'border-cyber-yellow' : index === 1 ? 'border-cyber-blue' : 'border-cyber-purple'} bg-cyber-darker`}>
                <div className="flex items-center mb-3">
                  <div className={`w-8 h-8 rounded-full bg-${index === 0 ? 'cyber-yellow' : index === 1 ? 'cyber-blue' : 'cyber-purple'} flex items-center justify-center text-cyber-dark font-bold mr-3`}>
                    {index + 1}
                  </div>
                  <h4 className="text-lg text-cyber-blue font-mono">{meme.title}</h4>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img 
                      src={meme.image_url} 
                      alt={meme.title}
                      className="w-full h-48 object-cover border-2 border-cyber-blue"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://picsum.photos/200/200';
                      }}
                    />
                  </div>
                  
                  <div className="md:w-2/3 flex flex-col justify-between">
                    <div>
                      {meme.tags && (
                        <div className="mb-3">
                          <div className="text-cyber-blue font-mono text-sm mb-2">TAGS:</div>
                          <div className="flex flex-wrap gap-2">
                            {meme.tags.split(',').map((tag, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-cyber-dark text-cyber-blue text-xs border border-cyber-blue"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="stats-container mt-3 p-3 border border-cyber-blue bg-cyber-dark">
                      <div className="text-cyber-yellow font-mono">STATS:</div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="stat-box">
                          <div className="text-cyber-blue font-mono text-sm">LIKES</div>
                          <div className="text-cyber-blue text-xl font-bold">{meme.likeCount}</div>
                        </div>
                        <div className="stat-box">
                          <div className="text-cyber-pink font-mono text-sm">DISLIKES</div>
                          <div className="text-cyber-pink text-xl font-bold">{meme.dislikeCount}</div>
                        </div>
                        <div className="stat-box">
                          <div className="text-cyber-yellow font-mono text-sm">SCORE</div>
                          <div className={`text-xl font-bold ${meme.score > 0 ? 'text-cyber-blue' : 'text-cyber-pink'}`}>
                            {meme.score > 0 ? '+' : ''}{meme.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Remaining entries in table format */}
          {leaderboardData.length > 5 && (
            <div className="p-4">
              <h3 className="text-lg text-cyber-blue font-mono mb-4">OTHER_CONTENDERS</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-blue bg-cyber-dark">
                    <th className="p-3 text-left text-cyber-blue font-mono">#</th>
                    <th className="p-3 text-left text-cyber-blue font-mono">MEME</th>
                    <th className="p-3 text-center text-cyber-blue font-mono">LIKES</th>
                    <th className="p-3 text-center text-cyber-blue font-mono">DISLIKES</th>
                    <th className="p-3 text-center text-cyber-blue font-mono">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.slice(5).map((meme, index) => (
                    <tr 
                      key={meme.id} 
                      className="border-b border-cyber-darker"
                    >
                      <td className="p-3 font-mono text-cyber-yellow">
                        {index + 6}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <img 
                            src={meme.image_url} 
                            alt={meme.title}
                            className="w-10 h-10 object-cover border border-cyber-purple mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://picsum.photos/200/200';
                            }}
                          />
                          <div className="font-mono text-cyber-blue truncate max-w-[200px]">{meme.title}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-cyber-blue">{meme.likeCount}</td>
                      <td className="p-3 text-center font-mono text-cyber-pink">{meme.dislikeCount}</td>
                      <td className={`p-3 text-center font-mono font-bold ${
                        meme.score > 0 
                          ? 'text-cyber-blue' 
                          : meme.score < 0 
                            ? 'text-cyber-pink' 
                            : 'text-gray-400'
                      }`}>
                        {meme.score > 0 ? '+' : ''}{meme.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          .leaderboard-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .stat-box {
            padding: 8px;
            text-align: center;
            background: rgba(5, 217, 232, 0.05);
            border: 1px solid rgba(5, 217, 232, 0.1);
          }
        `
      }} />
    </div>
  );
};

export default Leaderboard;

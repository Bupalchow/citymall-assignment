import React, { useState, useEffect } from 'react';
import Button from './Button';
import CyberPopup from './CyberPopup';
import { toggleLikeMeme, toggleDislikeMeme, placeBid, getMemeHighestBid, regenerateAI } from '../services/memeService';
import { getCurrentUser } from '../utils/auth';
import socketService from '../utils/socketService';

const MemeCard = ({ meme, onMemeUpdate, isGridLayout = false }) => {
  const [isLiked, setIsLiked] = useState(
    meme.likes?.some(like => like.user_id === getCurrentUser()?.id) || false
  );
  const [isDisliked, setIsDisliked] = useState(
    meme.dislikes?.some(dislike => dislike.user_id === getCurrentUser()?.id) || false
  );
  const [likeCount, setLikeCount] = useState(meme.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(meme.dislikes?.length || 0);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({ title: '', message: '', type: 'info' });
  const [highestBid, setHighestBid] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const currentUser = getCurrentUser();
  
  // Connect to WebSocket and listen for bid updates
  useEffect(() => {
    socketService.connect();
    
    const unsubscribe = socketService.on('bid_update', (data) => {
      if (data.memeId === meme.id) {
        // Update highest bid if the new bid is higher
        if (!highestBid || data.amount > highestBid.amount) {
          setHighestBid({
            amount: data.amount,
            username: data.username,
            user_id: data.userId,
            created_at: data.timestamp
          });
        }
        
        // Add to recent bids
        setRecentBids(prev => {
          const newBids = [{
            amount: data.amount,
            username: data.username,
            user_id: data.userId,
            created_at: data.timestamp
          }, ...prev].slice(0, 5);
          return newBids;
        });
        
        // Show notification
        setPopupInfo({
          title: 'NEW_BID',
          message: `${data.username} bid ${data.amount} credits on this meme!`,
          type: 'info'
        });
        setShowPopup(true);
      }
    });
    
    // Fetch initial highest bid
    const fetchHighestBid = async () => {
      const { data } = await getMemeHighestBid(meme.id);
      if (data) {
        setHighestBid(data);
      }
    };
    
    fetchHighestBid();
    
    return () => {
      unsubscribe();
    };
  }, [meme.id, highestBid]);
  
  const handleLikeToggle = async () => {
    if (!currentUser) {
      setPopupInfo({
        title: 'AUTHENTICATION_REQUIRED',
        message: 'You must be logged in to like memes.',
        type: 'error'
      });
      setShowPopup(true);
      return;
    }
    
    const { data, error } = await toggleLikeMeme(meme.id, currentUser.id);
    
    if (error) {
      setPopupInfo({
        title: 'OPERATION_FAILED',
        message: 'Failed to update like status. Please try again.',
        type: 'error'
      });
      setShowPopup(true);
      return;
    }
    
    // If user disliked before, remove the dislike
    if (isDisliked) {
      setIsDisliked(false);
      setDislikeCount(prev => prev - 1);
    }
    
    setIsLiked(data.liked);
    setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
  };
  
  const handleDislikeToggle = async () => {
    if (!currentUser) {
      setPopupInfo({
        title: 'AUTHENTICATION_REQUIRED',
        message: 'You must be logged in to dislike memes.',
        type: 'error'
      });
      setShowPopup(true);
      return;
    }
    
    const { data, error } = await toggleDislikeMeme(meme.id, currentUser.id);
    
    if (error) {
      setPopupInfo({
        title: 'OPERATION_FAILED',
        message: 'Failed to update dislike status. Please try again.',
        type: 'error'
      });
      setShowPopup(true);
      return;
    }
    
    // If user liked before, remove the like
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    }
    
    setIsDisliked(data.disliked);
    setDislikeCount(prev => data.disliked ? prev + 1 : prev - 1);
  };
  
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      setIsSubmitting(false);
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to place a bid');
      setIsSubmitting(false);
      return;
    }
    
    if (currentUser.credits < parseFloat(bidAmount)) {
      setError(`You don't have enough credits. Your balance: ${currentUser.credits}`);
      setIsSubmitting(false);
      return;
    }
    
    if (highestBid && parseFloat(bidAmount) <= highestBid.amount) {
      setError(`Bid must be higher than the current highest bid (${highestBid.amount})`);
      setIsSubmitting(false);
      return;
    }
    
    const { data, error } = await placeBid(meme.id, currentUser.id, bidAmount);
    
    if (error) {
      setError(error.message || 'Failed to place bid. Please try again.');
      setIsSubmitting(false);
      return;
    }
    
    setIsBidModalOpen(false);
    setIsSubmitting(false);
    setBidAmount('');
    if (onMemeUpdate) {
      onMemeUpdate();
    }
  };
  
  const handleRegenerateAI = async () => {
    if (!currentUser) {
      setPopupInfo({
        title: 'AUTHENTICATION_REQUIRED',
        message: 'You must be logged in to regenerate AI content.',
        type: 'error'
      });
      setShowPopup(true);
      return;
    }
    
    setIsRegenerating(true);
    
    const { data, error } = await regenerateAI(meme.id, meme.title, meme.tags);
    
    if (error) {
      setPopupInfo({
        title: 'OPERATION_FAILED',
        message: 'Failed to regenerate AI content. Please try again.',
        type: 'error'
      });
      setShowPopup(true);
    } else if (data) {
      // Update local meme data with new AI content
      meme.caption = data[0].caption;
      meme.vibe = data[0].vibe;
      
      setPopupInfo({
        title: 'AI_CONTENT_UPDATED',
        message: 'AI captions and vibes have been refreshed!',
        type: 'success'
      });
      setShowPopup(true);
    }
    
    setIsRegenerating(false);
  };
  
  return (
    <div className="meme-card terminal-window border-cyber-purple h-full flex flex-col">
      {/* Meme Header */}
      <div className="p-3 border-b border-cyber-purple flex justify-between items-center">
        <h3 className="text-lg text-cyber-yellow font-mono truncate">{meme.title}</h3>
        <div className="text-xs text-cyber-blue font-mono">
          {new Date(meme.created_at).toLocaleDateString()}
        </div>
      </div>
      
      {/* Meme Image */}
      <div className="p-3 bg-cyber-darker flex-grow">
        <div className="overflow-hidden border border-cyber-purple">
          <img 
            src={meme.image_url} 
            alt={meme.title}
            className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://picsum.photos/500/300';
            }}
          />
        </div>
      </div>
      
      {/* AI Content Section */}
      {(meme.caption || meme.vibe) && (
        <div className="p-3 border-t border-cyber-purple bg-cyber-darker">
          {meme.caption && (
            <div className="font-mono text-cyber-pink mb-1">
              <span className="text-cyber-blue">{'>'} </span>
              {meme.caption}
            </div>
          )}
          {meme.vibe && (
            <div className="flex justify-between items-center">
              <div className="font-mono text-cyber-yellow text-xs">
                <span className="text-cyber-blue">VIBE: </span>
                {meme.vibe}
              </div>
              <button 
                onClick={handleRegenerateAI}
                disabled={isRegenerating}
                className="text-xs text-cyber-blue hover:text-cyber-yellow"
              >
                {isRegenerating ? 'GENERATING...' : '[REGEN_AI]'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Highest Bid Display */}
      <div className="p-3 border-t border-cyber-purple bg-cyber-darker">
        {highestBid ? (
          <div className="font-mono text-cyber-yellow">
            <span className="text-cyber-blue">TOP_BID: </span>
            {highestBid.amount} credits by {highestBid.username}
          </div>
        ) : (
          <div className="font-mono text-gray-500">NO_BIDS_YET</div>
        )}
      </div>
      
      {/* Meme Tags */}
      <div className="p-3 border-t border-b border-cyber-purple bg-cyber-darker">
        <div className="flex flex-wrap gap-2">
          {meme.tags && meme.tags.split(',').slice(0, isGridLayout ? 2 : undefined).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-cyber-dark text-cyber-blue text-xs border border-cyber-blue"
            >
              #{tag.trim()}
            </span>
          ))}
          {isGridLayout && meme.tags && meme.tags.split(',').length > 2 && (
            <span className="text-xs text-cyber-blue">+{meme.tags.split(',').length - 2} more</span>
          )}
        </div>
      </div>
      
      {/* Likes, Dislikes and Bids Info */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLikeToggle}
            className={`flex items-center space-x-1 font-mono text-sm ${isLiked ? 'text-cyber-blue' : 'text-gray-400'}`}
          >
            <span className="text-lg">👍</span>
            <span>{likeCount}</span>
          </button>
          
          <button 
            onClick={handleDislikeToggle}
            className={`flex items-center space-x-1 font-mono text-sm ${isDisliked ? 'text-cyber-pink' : 'text-gray-400'}`}
          >
            <span className="text-lg">👎</span>
            <span>{dislikeCount}</span>
          </button>
        </div>
        
        <Button 
          onClick={() => {
            if (!currentUser) {
              setPopupInfo({
                title: 'AUTHENTICATION_REQUIRED',
                message: 'You must be logged in to place bids.',
                type: 'error'
              });
              setShowPopup(true);
              return;
            }
            setIsBidModalOpen(true);
          }}
          variant="secondary"
          className="py-1 px-3 text-xs"
        >
          BID {highestBid ? `(${highestBid.amount})` : 'NOW'}
        </Button>
      </div>
      
      {/* Bid Modal */}
      {isBidModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-cyber-darker bg-opacity-80 backdrop-blur-sm"
            onClick={() => setIsBidModalOpen(false)}
          ></div>
          
          <div className="cyber-popup w-full max-w-md z-10 border-2 border-cyber-pink bg-cyber-darker p-0">
            <div className="p-4 border-b border-cyber-pink flex items-center justify-between">
              <h3 className="text-xl text-cyber-pink font-mono">PLACE_BID</h3>
              <button 
                onClick={() => setIsBidModalOpen(false)}
                className="text-cyber-blue hover:text-cyber-pink focus:outline-none font-mono"
              >
                [X]
              </button>
            </div>
            
            <form onSubmit={handleBidSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 border border-cyber-pink bg-cyber-pink/10 text-cyber-pink text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-cyber-blue mb-2 font-mono text-sm">
                  {">>"} BID_AMOUNT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-cyber-darker border-2 border-cyber-pink text-cyber-yellow p-3
                             focus:outline-none focus:ring-1 focus:ring-cyber-blue
                             placeholder:text-gray-500 font-mono"
                    placeholder="Enter bid amount"
                    required
                  />
                </div>
                <div className="mt-2 text-cyber-blue text-xs">
                  Your credits: <span className="text-cyber-yellow">{currentUser?.credits || 0}</span>
                </div>
                <div className="mt-2 text-cyber-blue text-xs">
                  {highestBid ? `Current highest bid: ${highestBid.amount}` : 'No bids yet'}
                </div>
              </div>
              
              {/* Recent Bids */}
              {recentBids.length > 0 && (
                <div className="mb-4">
                  <div className="text-cyber-blue font-mono text-sm mb-2">RECENT_BIDS:</div>
                  <div className="max-h-24 overflow-y-auto bg-cyber-dark p-2 border border-cyber-blue">
                    {recentBids.map((bid, index) => (
                      <div key={index} className="text-xs mb-1 font-mono">
                        <span className="text-cyber-yellow">{bid.username}: </span>
                        <span className="text-cyber-blue">{bid.amount} credits</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  onClick={() => setIsBidModalOpen(false)}
                  variant="secondary"
                >
                  CANCEL
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  CONFIRM_BID
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Alert Popup */}
      <CyberPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupInfo.title}
        message={popupInfo.message}
        type={popupInfo.type}
      />
      
      {/* Fix JSX error by using a string for the style content instead of JSX */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .cyber-popup {
            clip-path: polygon(
              0 20px, 20px 0, 
              calc(100% - 20px) 0, 100% 20px, 
              100% calc(100% - 20px), calc(100% - 20px) 100%, 
              20px 100%, 0 calc(100% - 20px)
            );
          }
        `
      }} />
    </div>
  );
};

export default MemeCard;


import supabase from '../utils/supabaseClient';
import socketService from '../utils/socketService';
import { updateUserCredits, getCurrentUser } from '../utils/auth';
import { generateCaption, generateVibe } from '../utils/geminiService';

// Get all memes
export const getAllMemes = async () => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select(`
        *,
        likes:meme_likes(user_id),
        dislikes:meme_dislikes(user_id),
        bids:meme_bids(id, amount, user_id, created_at)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching memes:', error);
    return { data: null, error };
  }
};

export const getLeaderboard = async () => {
  try {
    // Get all memes with their likes and dislikes
    const { data: memes, error } = await supabase
      .from('memes')
      .select(`
        id,
        title,
        image_url,
        tags,
        created_at,
        user_id,
        likes:meme_likes(count),
        dislikes:meme_dislikes(count)
      `);
    
    if (error) throw error;
    
    // Calculate score for each meme (likes - dislikes)
    const memesWithScore = memes.map(meme => {
      const likeCount = meme.likes[0]?.count || 0;
      const dislikeCount = meme.dislikes[0]?.count || 0;
      const score = likeCount - dislikeCount;
      
      return {
        ...meme,
        likeCount,
        dislikeCount,
        score
      };
    });
    
    // Sort by score (highest first)
    const sortedMemes = memesWithScore.sort((a, b) => b.score - a.score);
    
    return { data: sortedMemes, error: null };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { data: null, error };
  }
};

export const createMeme = async (memeData, userId) => {
  try {
    if (!memeData.image_url || memeData.image_url.trim() === '') {
      memeData.image_url = 'https://picsum.photos/500/300';
    }
    
    // Generate AI caption and vibe before saving
    const caption = await generateCaption(memeData.tags, memeData.title);
    const vibe = await generateVibe(memeData.tags, memeData.title);
    
    const { data, error } = await supabase
      .from('memes')
      .insert([{ 
        ...memeData,
        user_id: userId,
        created_at: new Date().toISOString(),
        caption,
        vibe
      }])
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating meme:', error);
    return { data: null, error };
  }
};

// Like or unlike a meme
export const toggleLikeMeme = async (memeId, userId) => {
  try {
    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('meme_likes')
      .select('*')
      .eq('meme_id', memeId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    let result;
    
    // If like exists, remove it (unlike)
    if (existingLike) {
      result = await supabase
        .from('meme_likes')
        .delete()
        .eq('meme_id', memeId)
        .eq('user_id', userId);
    } 
    // Otherwise, add a like
    else {
      result = await supabase
        .from('meme_likes')
        .insert([{ 
          meme_id: memeId, 
          user_id: userId,
          created_at: new Date().toISOString()
        }]);
    }
    
    if (result.error) throw result.error;
    
    return { 
      data: { 
        liked: !existingLike,
        memeId
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { data: null, error };
  }
};

// Dislike or undislike a meme
export const toggleDislikeMeme = async (memeId, userId) => {
  try {
    // Check if dislike already exists
    const { data: existingDislike, error: checkError } = await supabase
      .from('meme_dislikes')
      .select('*')
      .eq('meme_id', memeId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    let result;
    
    // If dislike exists, remove it (undislike)
    if (existingDislike) {
      result = await supabase
        .from('meme_dislikes')
        .delete()
        .eq('meme_id', memeId)
        .eq('user_id', userId);
    } 
    // Otherwise, add a dislike
    else {
      // First, check if user has liked the meme and remove the like
      await supabase
        .from('meme_likes')
        .delete()
        .eq('meme_id', memeId)
        .eq('user_id', userId);
        
      result = await supabase
        .from('meme_dislikes')
        .insert([{ 
          meme_id: memeId, 
          user_id: userId,
          created_at: new Date().toISOString()
        }]);
    }
    
    if (result.error) throw result.error;
    
    return { 
      data: { 
        disliked: !existingDislike,
        memeId
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error toggling dislike:', error);
    return { data: null, error };
  }
};

// Place a bid on a meme
export const placeBid = async (memeId, userId, amount) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { data: null, error: { message: "User not authenticated" } };
    }
    
    if (currentUser.credits < parseFloat(amount)) {
      return { data: null, error: { message: "Not enough credits" } };
    }
    
    const { data: highestBid } = await supabase
      .from('meme_bids')
      .select('amount')
      .eq('meme_id', memeId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();
    
    if (highestBid && parseFloat(amount) <= highestBid.amount) {
      return { data: null, error: { message: `Bid must be higher than ${highestBid.amount}` } };
    }
    
    // Check if the table has a username column first (schema fix)
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'meme_bids' });
    
    let bidData = { 
      meme_id: memeId, 
      user_id: userId,
      amount: parseFloat(amount),
      created_at: new Date().toISOString()
    };
    
    // Add username only if the column exists
    if (!tableError && tableInfo && tableInfo.some(col => col === 'username')) {
      bidData.username = currentUser.username;
    }
    
    const { data, error } = await supabase
      .from('meme_bids')
      .insert([bidData])
      .select();
    
    if (error) throw error;
    
    const newCredits = currentUser.credits - parseFloat(amount);
    await updateUserCredits(userId, newCredits);
    
    // Send data to socket including username even if not stored in DB
    socketService.emitBid(memeId, amount);
    
    return { data, error: null };
  } catch (error) {
    console.error('Error placing bid:', error);
    return { data: null, error };
  }
};

export const getMemeHighestBid = async (memeId) => {
  try {
    const { data, error } = await supabase
      .from('meme_bids')
      .select('*')
      .eq('meme_id', memeId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching highest bid:', error);
    return { data: null, error };
  }
};

// Add new function to regenerate caption and vibe
export const regenerateAI = async (memeId, title, tags) => {
  try {
    const caption = await generateCaption(tags, title);
    const vibe = await generateVibe(tags, title);
    
    const { data, error } = await supabase
      .from('memes')
      .update({ caption, vibe })
      .eq('id', memeId)
      .select();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error regenerating AI content:', error);
    return { data: null, error };
  }
};

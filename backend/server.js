const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const activeUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;
  
  console.log(`User connected: ${username} (${userId})`);
  activeUsers.set(socket.id, { userId, username });
  socket.on('new_bid', (bidData) => {
    console.log('New bid received:', bidData);
    io.emit('bid_update', bidData);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (${userId})`);
    activeUsers.delete(socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Bidding Socket Server is running');
});

// Fallbacks for when API fails
const FALLBACK_CAPTIONS = [
  "To the MOON!", "Brrr goes stonks", "HODL til infinity", 
  "Diamond hands activated", "When lambo?", "This is the way"
];

const FALLBACK_VIBES = [
  "Neon Crypto Chaos", "Retro Stonks Vibes", "Digital Gold Rush",
  "Meme Economy Explosion", "Bullish Tech Energy"  
];

// Endpoint for manual caption generation
app.post('/api/memes/:id/ai', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the meme from Supabase
    const { data: meme, error: memeError } = await supabase
      .from('memes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (memeError) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    
    // Generate content using Gemini API if API key exists
    let caption, vibe;
    
    if (process.env.GEMINI_API_KEY) {
      // Generate caption
      const captionPrompt = `Generate a funny, short caption for a meme with title: "${meme.title}" and tags: ${meme.tags}. Keep it under 10 words and make it humorous.`;
      const captionResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: captionPrompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 30
          }
        })
      });
      
      if (captionResponse.ok) {
        const captionData = await captionResponse.json();
        caption = captionData.candidates[0].content.parts[0].text.trim().replace(/^["'](.*)["']$/, "$1");
      } else {
        caption = FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
      }
      
      const vibePrompt = `Describe the vibe of a meme with title: "${meme.title}" and tags: ${meme.tags} in a catchy 2-4 word phrase. Make it sound like a mood or aesthetic.`;
      const vibeResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: vibePrompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 20
          }
        })
      });
      
      if (vibeResponse.ok) {
        const vibeData = await vibeResponse.json();
        vibe = vibeData.candidates[0].content.parts[0].text.trim().replace(/^["'](.*)["']$/, "$1");
      } else {
        vibe = FALLBACK_VIBES[Math.floor(Math.random() * FALLBACK_VIBES.length)];
      }
    } else {
      caption = FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
      vibe = FALLBACK_VIBES[Math.floor(Math.random() * FALLBACK_VIBES.length)];
    }

    const { data: updatedMeme, error: updateError } = await supabase
      .from('memes')
      .update({ caption, vibe })
      .eq('id', id)
      .select();
      
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update meme' });
    }
    
    res.json({ data: updatedMeme[0] });
    
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

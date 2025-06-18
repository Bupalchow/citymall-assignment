
const cache = {
  captions: {},
  vibes: {}
};

const FALLBACK_CAPTIONS = [
  "To the MOON!",
  "Brrr goes stonks",
  "HODL til infinity",
  "Diamond hands activated",
  "When lambo?",
  "This is the way",
  "Much wow, very profit",
  "Not financial advice, but...",
  "Buy high, sell low",
  "YOLO to the moon!"
];

const FALLBACK_VIBES = [
  "Neon Crypto Chaos",
  "Retro Stonks Vibes",
  "Digital Gold Rush",
  "Meme Economy Explosion",
  "Bullish Tech Energy",
  "Cyberpunk Trading Floor",
  "Web3 Revolution Aesthetic",
  "Future of Finance Mood",
  "Decentralized Dreams",
  "Blockchain Party Mode"
];

const getRandomFallback = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const generateCaption = async (tags, title) => {
  const cacheKey = `${tags}-${title}`;
  
  if (cache.captions[cacheKey]) {
    return cache.captions[cacheKey];
  }
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const fallback = getRandomFallback(FALLBACK_CAPTIONS);
    cache.captions[cacheKey] = fallback;
    return fallback;
  }
  
  try {
    const prompt = `Generate a funny, short caption for a meme with title: "${title}" and tags: ${tags}. Keep it under 10 words and make it humorous. Don't use quotes in your response.`;
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 30
        }
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate caption");
    }
    
    const data = await response.json();
    let caption = data.candidates[0].content.parts[0].text.trim();
    
    caption = caption.replace(/^["'](.*)["']$/, "$1");
    
    cache.captions[cacheKey] = caption;
    return caption;
    
  } catch (error) {
    console.error("Error generating caption:", error);
    const fallback = getRandomFallback(FALLBACK_CAPTIONS);
    cache.captions[cacheKey] = fallback;
    return fallback;
  }
};

export const generateVibe = async (tags, title) => {
  const cacheKey = `${tags}-${title}`;
  
  if (cache.vibes[cacheKey]) {
    return cache.vibes[cacheKey];
  }
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // If no API key is set, return fallback
  if (!apiKey) {
    const fallback = getRandomFallback(FALLBACK_VIBES);
    cache.vibes[cacheKey] = fallback;
    return fallback;
  }
  
  try {
    const prompt = `Describe the vibe of a meme with title: "${title}" and tags: ${tags} in a catchy 2-4 word phrase. Make it sound like a mood or aesthetic (e.g. "Retro Stonks Vibes", "Neon Crypto Chaos"). Don't use quotes in your response.`;
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 20
        }
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate vibe");
    }
    
    const data = await response.json();
    let vibe = data.candidates[0].content.parts[0].text.trim();
    
    // Remove quotes if present
    vibe = vibe.replace(/^["'](.*)["']$/, "$1");
    
    // Cache the result
    cache.vibes[cacheKey] = vibe;
    return vibe;
    
  } catch (error) {
    console.error("Error generating vibe:", error);
    const fallback = getRandomFallback(FALLBACK_VIBES);
    cache.vibes[cacheKey] = fallback;
    return fallback;
  }
};

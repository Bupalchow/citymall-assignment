import supabase from './supabaseClient';
import CryptoJS from 'crypto-js';

const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

export const registerUser = async (username, password) => {
  try {
    const { data: existingUser } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', username)
      .single();
      
    if (existingUser) {
      return { error: { message: 'Username already exists' } };
    }

    const hashedPassword = hashPassword(password);
    const { data, error } = await supabase
      .from('custom_users')
      .insert([{ 
        username, 
        password: hashedPassword,
        created_at: new Date().toISOString(),
        credits: 500 
      }])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const loginUser = async (username, password) => {
  try {
    const hashedPassword = hashPassword(password);
    const { data: user, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('username', username)
      .eq('password', hashedPassword)
      .single();
    
    if (error) throw error;
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Invalid username or password' } 
      };
    }
    await supabase
      .from('custom_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export const updateUserCredits = async (userId, newCredits) => {
  try {
    const { data, error } = await supabase
      .from('custom_users')
      .update({ credits: newCredits })
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    const user = getCurrentUser();
    if (user && user.id === userId) {
      user.credits = newCredits;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

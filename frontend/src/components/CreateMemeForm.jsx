import React, { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import CyberPopup from './CyberPopup';
import { createMeme } from '../services/memeService';
import { getCurrentUser } from '../utils/auth';

const CreateMemeForm = ({ onMemeCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({ title: '', message: '', type: 'info' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setPopupInfo({
        title: 'AUTHENTICATION_REQUIRED',
        message: 'You must be logged in to create memes.',
        type: 'error'
      });
      setShowPopup(true);
      setIsSubmitting(false);
      return;
    }
    
    // Validate title
    if (!formData.title.trim()) {
      setPopupInfo({
        title: 'VALIDATION_ERROR',
        message: 'Title is required.',
        type: 'error'
      });
      setShowPopup(true);
      setIsSubmitting(false);
      return;
    }
    
    const { data, error } = await createMeme(formData, currentUser.id);
    
    if (error) {
      setPopupInfo({
        title: 'CREATION_FAILED',
        message: 'Failed to create meme. Please try again.',
        type: 'error'
      });
      setShowPopup(true);
      setIsSubmitting(false);
      return;
    }
    
    // Reset form
    setFormData({
      title: '',
      image_url: '',
      tags: ''
    });
    
    setPopupInfo({
      title: 'MEME_CREATED',
      message: 'Your meme has been successfully created!',
      type: 'success'
    });
    setShowPopup(true);
    
    // Notify parent component
    if (onMemeCreated) {
      onMemeCreated(data[0]);
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="terminal-window border-cyber-blue mb-8">
      <div className="p-4 border-b border-cyber-blue">
        <h2 className="text-xl text-cyber-blue font-mono">CREATE_NEW_MEME</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <InputField
          id="title"
          label="MEME_TITLE"
          value={formData.title}
          onChange={handleChange}
          name="title"
          required
          placeholder="Enter a catchy title"
        />
        
        <InputField
          id="image_url"
          label="IMAGE_URL"
          value={formData.image_url}
          onChange={handleChange}
          name="image_url"
          placeholder="Enter image URL (or leave empty for random image)"
        />
        
        <InputField
          id="tags"
          label="TAGS"
          value={formData.tags}
          onChange={handleChange}
          name="tags"
          placeholder="Comma-separated tags (e.g. funny,crypto,art)"
        />
        
        <div className="mt-6">
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            CREATE_MEME
          </Button>
        </div>
      </form>
      
      <CyberPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupInfo.title}
        message={popupInfo.message}
        type={popupInfo.type}
      />
    </div>
  );
};

export default CreateMemeForm;

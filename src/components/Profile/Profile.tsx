import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Edit3, 
  Check, 
  X,
  User,
  Mail,
  Phone,
  Globe,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../../data/supabaseClient';
import { useApp } from '../../context/AppContext';

interface ProfileProps {
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser } = useApp();
  
  const [profile, setProfile] = useState({
    profile_name: currentUser?.name || '',
    profile_picture: currentUser?.avatar ? { url: currentUser.avatar } : {},
    email: '',
    phone_number: currentUser?.phone || '',
    about: 'Hey there! I am using LUVIX.',
    language_preference: { code: 'en', name: 'English' }
  });
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState('');
  const [previousProfileName, setPreviousProfileName] = useState('');
  const [previousEmail, setPreviousEmail] = useState('');
  const [previousAbout, setPreviousAbout] = useState('');
  const [previousLanguage, setPreviousLanguage] = useState({ code: 'en', name: 'English' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load existing profile data on mount
  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  // Fetch profile data from database
  const fetchProfileData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user')
        .select('profile_name, email, about, language_preference')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile data:', error);
        return;
      }

      if (data) {
        // Update profile state with fetched data
        setProfile(prev => ({
          ...prev,
          profile_name: data.profile_name || currentUser?.name || '',
          email: data.email || '',
          about: data.about || 'Hey there! I am using LUVIX.',
          language_preference: data.language_preference || { code: 'en', name: 'English' }
        }));

        // Update previous values for change detection
        setPreviousProfileName(data.profile_name || currentUser?.name || '');
        setPreviousEmail(data.email || '');
        setPreviousAbout(data.about || 'Hey there! I am using LUVIX.');
        setPreviousLanguage(data.language_preference || { code: 'en', name: 'English' });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const userId = currentUser?.id;

  const updateProfileName = async (newName: string) => {
    
    console.log(currentUser?.name);
    console.log(currentUser?.id);
    
    const trimmedName = newName.trim();
    if (trimmedName === previousProfileName) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const TABLE = 'user';
      const COLUMN = 'profile_name';
      
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: trimmedName })
        .eq('id', userId)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any row where profile_name is not null
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: trimmedName })
          .not(COLUMN, 'is', null)
          .select();
        
        if (fb.error && import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save profile name (fallback):', fb.error.message);
          setMessage({ type: 'error', text: 'Failed to update profile name (fallback)' });
        } else {
          setMessage({ type: 'success', text: 'Profile name updated successfully!' });
        }
      } else if (!error) {
        setMessage({ type: 'success', text: 'Profile name updated successfully!' });
      }

      if (error && import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to save profile name:', error.message);
        setMessage({ type: 'error', text: 'Failed to update profile name' });
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .eq('id', userId)
          .single();
        
        if (!check.error && check.data) {
          const updatedName = check.data[COLUMN] || '';
          setProfileName(updatedName);
          setPreviousProfileName(updatedName);
        }
      } catch {
        // ignore verification errors
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileEmail = async (newEmail: string) => {
    const trimmedEmail = newEmail.trim();
    if (trimmedEmail === previousEmail) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const TABLE = 'user';
      const COLUMN = 'email';
      
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: trimmedEmail })
        .eq('id', userId)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any row where email is not null
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: trimmedEmail })
          .not(COLUMN, 'is', null)
          .select();
        
        if (fb.error && import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save email (fallback):', fb.error.message);
          setMessage({ type: 'error', text: 'Failed to update email (fallback)' });
        } else {
          setMessage({ type: 'success', text: 'Email updated successfully!' });
        }
      } else if (!error) {
        setMessage({ type: 'success', text: 'Email updated successfully!' });
      }

      if (error && import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to save email:', error.message);
        setMessage({ type: 'error', text: 'Failed to update email' });
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .eq('id', userId)
          .single();
        
        if (!check.error && check.data) {
          const updatedEmail = check.data[COLUMN] || '';
          setProfile(prev => ({ ...prev, email: updatedEmail }));
          setPreviousEmail(updatedEmail);
        }
      } catch {
        // ignore verification errors
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileAbout = async (newAbout: string) => {
    const trimmedAbout = newAbout.trim();
    if (trimmedAbout === previousAbout) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const TABLE = 'user';
      const COLUMN = 'about';
      
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: trimmedAbout })
        .eq('id', userId)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any row where about is not null
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: trimmedAbout })
          .not(COLUMN, 'is', null)
          .select();
        
        if (fb.error && import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save about (fallback):', fb.error.message);
          setMessage({ type: 'error', text: 'Failed to update about (fallback)' });
        } else {
          setMessage({ type: 'success', text: 'About updated successfully!' });
        }
      } else if (!error) {
        setMessage({ type: 'success', text: 'About updated successfully!' });
      }

      if (error && import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to save about:', error.message);
        setMessage({ type: 'error', text: 'Failed to update about' });
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .eq('id', userId)
          .single();
        
        if (!check.error && check.data) {
          const updatedAbout = check.data[COLUMN] || '';
          setProfile(prev => ({ ...prev, about: updatedAbout }));
          setPreviousAbout(updatedAbout);
        }
      } catch {
        // ignore verification errors
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileLanguage = async (newLanguage: { code: string; name: string }) => {
    if (JSON.stringify(newLanguage) === JSON.stringify(previousLanguage)) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const TABLE = 'user';
      const COLUMN = 'language_preference';
      
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: newLanguage })
        .eq('id', userId)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any row where language_preference is not null
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: newLanguage })
          .not(COLUMN, 'is', null)
          .select();
        
        if (fb.error && import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save language preference (fallback):', fb.error.message);
          setMessage({ type: 'error', text: 'Failed to update language preference (fallback)' });
        } else {
          setMessage({ type: 'success', text: 'Language preference updated successfully!' });
        }
      } else if (!error) {
        setMessage({ type: 'success', text: 'Language preference updated successfully!' });
      }

      if (error && import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to save language preference:', error.message);
        setMessage({ type: 'error', text: 'Failed to update language preference' });
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .eq('id', userId)
          .single();
        
        if (!check.error && check.data) {
          const updatedLanguage = check.data[COLUMN] || { code: 'en', name: 'English' };
          setProfile(prev => ({ ...prev, language_preference: updatedLanguage }));
          setPreviousLanguage(updatedLanguage);
        }
      } catch {
        // ignore verification errors
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

   const updateProfilePicture = async (newPicture: { url: string }) => {
    if (JSON.stringify(newPicture) === JSON.stringify(profile.profile_picture.url)) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    
    try {
      const TABLE = 'user';
      const COLUMN = 'profile_picture';
      
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: {"url": newPicture.url} })
        .eq('id', userId)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any row where language_preference is not null
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: newLanguage })
          .not(COLUMN, 'is', null)
          .select();
        
        if (fb.error && import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save language preference (fallback):', fb.error.message);
          setMessage({ type: 'error', text: 'Failed to update language preference (fallback)' });
        } else {
          setMessage({ type: 'success', text: 'Language preference updated successfully!' });
        }
      } else if (!error) {
        setMessage({ type: 'success', text: 'Language preference updated successfully!' });
      }

      if (error && import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to save language preference:', error.message);
        setMessage({ type: 'error', text: 'Failed to update language preference' });
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .eq('id', userId)
          .single();
        
        if (!check.error && check.data) {
          const updatedLanguage = check.data[COLUMN] || { code: 'en', name: 'English' };
          setProfile(prev => ({ ...prev, language_preference: updatedLanguage }));
          setPreviousLanguage(updatedLanguage);
        }
      } catch {
        // ignore verification errors
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };


  const handleNameSave = async () => {
    if (!profile.profile_name.trim()) {
      setIsEditingName(false);
      return;
    }

    await updateProfileName(profile.profile_name);
    setIsEditingName(false);
  };

  const handleEmailSave = async () => {
    if (!profile.email.trim()) {
      setIsEditingEmail(false);
      return;
    }

    await updateProfileEmail(profile.email);
    setIsEditingEmail(false);
  };

  const handleAboutSave = async () => {
    await updateProfileAbout(profile.about);
    setIsEditingAbout(false);
  };

  const handleLanguageSave = async (language: { code: string; name: string }) => {
    await updateProfileLanguage(language);
    setIsEditingLanguage(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload to Supabase Storage - using 'profile_pic' bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${currentUser.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_pic')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pic')
        .getPublicUrl(fileName);

      // Log the uploaded file URL
      console.log('Profile picture uploaded successfully!');
      console.log('Public URL:', publicUrl);

      await updateProfilePicture({url: publicUrl});

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl
        }
      });

      if (updateError) throw updateError;

      // Update local state
      setCurrentUser({
        ...currentUser,
        avatar: publicUrl
      });

      // Update profile state
      setProfile(prev => ({
        ...prev,
        profile_picture: { url: publicUrl }
      }));

             // Note: The user table doesn't have a profile_picture column
       // The profile picture URL is stored in user metadata and local state only
       console.log('Profile picture URL stored in user metadata and local state');
       console.log('To store in database, add a profile_picture column to the user table');

      // Show success message
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

    } catch (error) {
      console.error('Error details:', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelEdit = (field: 'name' | 'email' | 'about' | 'language') => {
    if (field === 'name') {
      setProfile(prev => ({
        ...prev,
        profile_name: currentUser?.name || ''
      }));
      setIsEditingName(false);
    } else if (field === 'email') {
      setProfile(prev => ({
        ...prev,
        email: ''
      }));
      setIsEditingEmail(false);
    } else if (field === 'about') {
      setProfile(prev => ({
        ...prev,
        about: 'Hey there! I am using LUVIX.'
      }));
      setIsEditingAbout(false);
    } else if (field === 'language') {
      setIsEditingLanguage(false);
    }
  };

  return (
    <div className="w-full  bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-green-600 dark:bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-green-700 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-3 mx-4 mt-4 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : message.type === 'error' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
          <div className="relative inline-block">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
              {profile.profile_picture.url ? (
                <img
                  src={profile.profile_picture.url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                  <User className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}            
              disabled={uploadingAvatar}
              className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Click the camera icon to change your profile photo
          </p>
        </div>

        {/* Profile Information */}
        <div className="p-4 space-y-6">
          {/* Name Section */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <User className="w-4 h-4" />
              <span>Name</span>
            </label>
            
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={profile.profile_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, profile_name: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your name"
                  maxLength={25}
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  disabled={isSaving || !profile.profile_name.trim()}
                  className="p-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCancelEdit('name')}
                  className="p-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingName(true)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
              >
                <span className="text-gray-900 dark:text-white">{profile.profile_name || 'User'}</span>
                <Edit3 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is not your username or pin. This name will be visible to your LUVIX contacts.
            </p>
          </div>

          {/* Email Section */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            
            {isEditingEmail ? (
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  autoFocus
                />
                <button
                  onClick={handleEmailSave}
                  disabled={isSaving || !profile.email.trim()}
                  className="p-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCancelEdit('email')}
                  className="p-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingEmail(true)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
              >
                <span className="text-gray-900 dark:text-white">{profile.email || 'Add email address'}</span>
                <Edit3 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your email address for account recovery and notifications.
            </p>
          </div>

          {/* About Section */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Edit3 className="w-4 h-4" />
              <span>About</span>
            </label>
            
            {isEditingAbout ? (
              <div className="space-y-2">
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Add a few words about yourself"
                  maxLength={139}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{profile.about.length}/139</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAboutSave}
                      disabled={isSaving}
                      className="p-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCancelEdit('about')}
                      className="p-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingAbout(true)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
              >
                <span className="text-gray-900 dark:text-white">{profile.about}</span>
                <Edit3 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
            )}
          </div>

          {/* Language Section */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Globe className="w-4 h-4" />
              <span>Language</span>
            </label>
            
            {isEditingLanguage ? (
              <div className="space-y-2">
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSave(lang)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        profile.language_preference.code === lang.code 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleCancelEdit('language')}
                  className="w-full p-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingLanguage(true)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
              >
                <span className="text-gray-900 dark:text-white">{profile.language_preference.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose your preferred language for the app interface.
            </p>
          </div>

          {/* Phone Section (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-900 dark:text-white">{profile.phone_number || 'Not provided'}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Phone number cannot be changed here.
            </p>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

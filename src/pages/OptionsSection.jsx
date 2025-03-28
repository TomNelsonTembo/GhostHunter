import { useState } from 'react';
import pb from '../api/pocketbase';

export default function OptionsSection({ user, setUser, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    try {
      await pb.collection('users').update(user.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: confirmPassword
      });
      setMessage({ 
        text: 'Password updated successfully', 
        type: 'success' 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto-close after success
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await pb.collection('users').update(user.id, formData);
      setUser(updatedUser);
      setMessage({ 
        text: 'Avatar updated successfully', 
        type: 'success' 
      });
      
      // Update chrome storage
      if (chrome.storage?.sync) {
        chrome.storage.sync.set({ user: updatedUser });
      }
      // Auto-close after success
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="options-section">
      <h3>Account Options</h3>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="option-card">
        <h4>Change Password</h4>
        <form onSubmit={handlePasswordUpdate}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="8"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </div>

      <div className="option-card">
        <h4>Change Avatar</h4>
        <div className="avatar-upload">
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpdate}
          />
          <label htmlFor="avatar-upload">Choose New Image</label>
          <p>Maximum size: 2MB</p>
        </div>
      </div>

      <div className="options-footer">
        <button 
          className="cancel-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
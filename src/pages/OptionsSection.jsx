import { useState } from 'react';
import pb from '../api/pocketbase';


export default function OptionsSection({ user, setUser, onClose }) {
  // const [currentPassword, setCurrentPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // const handlePasswordUpdate = async (e) => {
  //   e.preventDefault();
    
  //   if (newPassword !== confirmPassword) {
  //     setMessage({ text: 'Passwords do not match', type: 'error' });
  //     return;
  //   }

  //   try {
  //     await pb.collection('users').update(user.id, {
  //       oldPassword: currentPassword,
  //       password: newPassword,
  //       passwordConfirm: confirmPassword
  //     });
  //     setMessage({ 
  //       text: 'Password updated successfully', 
  //       type: 'success' 
  //     });
  //     setCurrentPassword('');
  //     setNewPassword('');
  //     setConfirmPassword('');
  //     // Auto-close after success
  //     setTimeout(onClose, 1500);
  //   } catch (err) {
  //     setMessage({ text: err.message, type: 'error' });
  //   }
  // };
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
      // if (chrome.storage?.local) {
      //   chrome.storage.local.set({ user: updatedUser });
      // }
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
  
      {/* Show verification OR premium (mutually exclusive) */}
      {!pb.authStore.model?.verified ? (
        // Verification Section (shown only if NOT verified)
        <div className="option-card">
          <h4>Email Verification</h4>
          <p className="unverified-status">⚠️ Your email is not verified</p>
          <button 
            className="verify-button"
            onClick={async () => {
              try {
                await pb.collection('users').requestVerification(pb.authStore.model.email);
                setMessage({
                  text: "Verification email sent! Check your inbox.",
                  type: "success"
                });
              } catch (err) {
                setMessage({
                  text: "Failed to send verification: " + err.message,
                  type: "error"
                });
              }
            }}
          >
            Send Verification Email
          </button>
        </div>
      ) : (
        // Premium Section (shown only if verified)
        <div className="option-card">
          <h4>Account Upgrade</h4>
          {pb.authStore.model?.premium ? (
            <p className="premium-status">🌟 You're a premium user!</p>
          ) : (
            <>
              <p>Upgrade for advanced features:</p>
              <ul className="premium-features">
                <li>Unlimited job tracking</li>
                <li>Priority support</li>
                <li>Advanced AI analytics</li>
              </ul>
              <button 
                className="upgrade-button"
                onClick={() => window.open('https://yourwebsite.com/pricing', '_blank')}
              >
                Upgrade to Premium ($9.99/month)
              </button>
            </>
          )}
        </div>
      )}
  
      {/* Avatar Upload (always shown) */}
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
  
      {/* Footer (always shown) */}
      
    </div>
  );
}
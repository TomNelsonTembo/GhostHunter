import ghostLogo from '/assets/icon02.png';
import './App.css';
import { useState, useEffect } from 'react';
import { supabase, handleLogin } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Retrieve session from chrome.storage
    chrome.storage.local.get('session', (data) => {
      if (data.session) {
        setSession(data.session);
      }
    });

    // Fetch the current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        chrome.storage.local.set({ session });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      chrome.storage.local.set({ session });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      chrome.storage.local.remove('session');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!session) {
    return (
      <>
        <div>
          <a href="" target="_blank" rel="noopener noreferrer">
            <img src={ghostLogo} className="logo" alt="GhostHunter logo" />
          </a>
        </div>
        <h1>Ghost Hunter</h1>
        <div className="card">
          <button onClick={handleLogin}>
            Login with Google
          </button>
          <p>
            Click <code>Login with Google</code> to start using Ghost Hunter
          </p>
        </div>
        <p className="read-the-docs">
          A browser extension designed to help job seekers identify and track ghost job postings.
        </p>
      </>
    );
  } else {
    return (
      <>
        <div>
          <a href="" target="_blank" rel="noopener noreferrer">
            <img src={ghostLogo} className="logo" alt="GhostHunter logo" />
          </a>
        </div>
        <h1>Ghost Hunter</h1>
        <div className="card">
          <p>
            Welcome to Ghost Hunter, {session.user?.email}
          </p>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p className="read-the-docs">
          A browser extension designed to help job seekers identify and track ghost job postings.
        </p>
      </>
    );
  }
}

export default App;
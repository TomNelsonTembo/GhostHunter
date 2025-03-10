import ghostLogo from "/assets/icon02.png";
import "./App.css";
import { useState, useEffect } from "react";
import { supabase, handleLogin } from "./supabaseClient";
import { Session } from "@supabase/supabase-js";

async function getStoredTokens() {
  try {
    const data = await chrome.storage.local.get(["access_token", "refresh_token"]);

    const accessToken = data.access_token || null;
    const refreshToken = data.refresh_token || null;

    if (accessToken && refreshToken) {
      console.log("✅ Access Token:", accessToken);
      console.log("✅ Refresh Token:", refreshToken);

      await setSession({ accessToken, refreshToken });
    } else {
      console.warn("⚠️ Tokens not found in storage. User may need to re-authenticate.");
    }
  } catch (error) {
    console.error("❌ Error retrieving tokens:", error);
  }
}

async function setSession({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;

    console.log("✅ Session set successfully:", data);
  } catch (error) {
    console.error("❌ Failed to set session:", error);
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getStoredTokens(); // Restore session on load

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      chrome.storage.session.set({ session: JSON.stringify(session) }); // Store as JSON
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      chrome.storage.local.remove("session");
    } catch (error) {
      console.error("Error logging out:", error);
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
          <button onClick={handleLogin}>Login with Google</button>
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
          <p>Welcome to Ghost Hunter, {session.user?.user_metadata.full_name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <p className="read-the-docs">
          A browser extension designed to help job seekers identify and track ghost job postings.
        </p>
      </>
    );
  }
}

export default App;

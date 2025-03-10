import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
chrome.storage.sync.set({ supabaseUrl: supabaseUrl, supabaseAnonKey: supabaseAnonKey }, () => {
  console.log('Keys stored.');
});

export async function handleLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: chrome.identity.getRedirectURL(),
    },
  });
  if (error) throw error;
  await chrome.tabs.create({ url: data.url });
}
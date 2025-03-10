function parseUrlHash(url) {
  const hashString = new URL(url).hash.substring(1); // Remove '#'
  console.log("Hash String:", hashString);

  const hashParts = hashString.split("&"); // Split into key=value pairs
  return new Map(
    hashParts.map((part) => {
      const [name, value] = part.split("=");
      return [name, decodeURIComponent(value || "")]; // Handle empty values safely
    })
  );
}


/**
 * Method used to finish OAuth callback for user authentication.
 */
async function handleUrl(url) {
    try {
    
      // Extract tokens from hash
      const hashMap = parseUrlHash(url);
      const access_token = hashMap.get('access_token');
      const refresh_token = hashMap.get('refresh_token');
  
     
      if (!access_token || !refresh_token) {
        throw new Error(`No Supabase tokens found in URL hash`);
      }
  
      // Persist session to Chrome storage
      await chrome.storage.local.set({ access_token: access_token, refresh_token: refresh_token });
  
      // Redirect the tab after OAuth
      // chrome.tabs.update({ url: "https://google.com" });
  
      console.log(`Finished handling URL`);
    } catch (error) {
      console.error("URL handling error:", error);
    }
  }
  
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Opens a popup for Google Sign-In.
 * @see https://github.com/supabase/gotrue-js#google
 */
// export const handleLogin = async () => {
//     try {
//         // Initiate the OAuth sign-in process with Supabase
//         const { data, error } = await supabase.auth.signInWithOAuth({
//             provider: "google",
//             options: {
//                 redirectTo: `${window.location.origin}/callback`,
//               },
//         });

//         if (error) {
//             console.error("Error during sign-in:", error);
//             return;
//         }

//         // Open the OAuth URL in a new tab
//         const newTab = window.open(data.url, "_blank");

//         if (!newTab) {
//             console.error("Failed to open a new tab. Please check your browser settings.");
//             return;
//         }

//         // Check for sign-in completion every second
//         const checkAuth = setInterval(async () => {
//             try {
//                 const { data: userData, error: userError } = await supabase.auth.getUser();

//                 if (userError) {
//                     console.error("Error fetching user:", userError);
//                     clearInterval(checkAuth);
//                     return;
//                 }

//                 if (userData?.user) {
//                     console.log("User signed in:", userData.user);

//                     // Close the tab if it's still open
//                     if (newTab && !newTab.closed) {
//                         newTab.close();
//                     }

//                     clearInterval(checkAuth);
//                 }
//             } catch (err) {
//                 console.error("Error during auth check:", err);
//                 clearInterval(checkAuth);
//             }
//         }, 1000);

//         // Handle tab closing manually by the user
//         const tabCheck = setInterval(() => {
//             if (newTab.closed) {
//                 clearInterval(checkAuth);
//                 clearInterval(tabCheck);
//                 console.log("Tab closed by user.");
//             }
//         }, 1000);

//     } catch (err) {
//         console.error("Unexpected error during sign-in:", err);
//     }
// };
  
const manifest = chrome.runtime.getManifest();
const url = new URL("https://accounts.google.com/o/oauth2/auth");

url.searchParams.set("client_id", manifest.oauth2.client_id);
url.searchParams.set("response_type", "id_token");
url.searchParams.set("access_type", "offline");
url.searchParams.set("redirect_uri", `https://${chrome.runtime.id}.chromiumapp.org`);
url.searchParams.set("scope", manifest.oauth2.scopes.join(" "));

export const handleLogin = () => {
  chrome.identity.launchWebAuthFlow(
    {
      url: url.href,
      interactive: true,
    },
    async (redirectedTo) => {
      if (chrome.runtime.lastError) {
        console.error("Authentication failed:", chrome.runtime.lastError);
        return;
      }

      try {
        // Extract `id_token` from the redirected URL fragment (#)
        const params = new URLSearchParams(new URL(redirectedTo).hash.replace("#", "?"));
        const idToken = params.get("id_token");

        if (!idToken) {
          throw new Error("ID Token not found in response");
        }

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (error) {
          console.error("Supabase authentication failed:", error);
          return;
        }

        console.log("User authenticated successfully:", data.user);
      } catch (err) {
        console.error("Error processing authentication:", err);
      }
    }
  );
};

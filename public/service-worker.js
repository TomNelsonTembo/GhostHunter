chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveJob") {
        sendDataToPocketBase(request)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for async response
    }
});

async function sendDataToPocketBase(data) {
    const pdAuth = await getAuth(); // Function to get stored token


    if (!pdAuth.id || !pdAuth.token) {
        throw new Error("User not authenticated");
    }

    const response = await fetch("http://localhost:8090/api/collections/extension_data/records", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${pdAuth.token}`
        },
        body: JSON.stringify({
            user: pdAuth.id,
            ...data.job
        })
    });

    if (!response.ok) {
        throw new Error("Failed to send data");
    }
    
    return await response.json();
}

function getAuth() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["pb_auth_user"], (result) => {
            resolve(result.pb_auth_user || null);
        });
    });
}
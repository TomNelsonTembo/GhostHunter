
function scanPageForJobs() {
  const jobs = [];
  const currentUrl = window.location.href;

  // LinkedIn job detection
  if (currentUrl.includes("linkedin.com/jobs")) {
    // Single job view
    if (
      currentUrl.includes("/jobs/collections/") ||
      currentUrl.includes("/jobs/search/")
    ) {
      try {
        // Extract job details
        const profileElements = document.getElementsByClassName(
          "jobs-search__job-details--container"
        );
        const titleElement = profileElements[0].getAttribute("aria-label");
        const companyElement = document.getElementsByClassName(
          "job-details-jobs-unified-top-card__company-name"
        )[0].textContent;
        const locationElement = document
          .getElementsByClassName(
            "job-details-jobs-unified-top-card__primary-description-container"
          )[0]
          .textContent.trim()
          .split(" ·");
        // const salaryElement = "";
        // const postedDateElement = "";
        const descriptionElement = "";

        // Populate jobDetails

        // Check if listing is old
        // const postedText = postedDate.toLowerCase();

        // Create job object for the array
        jobs.push({
          title: titleElement,
          company: companyElement,
          location: locationElement,
          url: currentUrl,
          status: "pending",
          domain: "linkedin",
          job_description: descriptionElement,
          // postedDate: jobDetails.postedDate,
          // payStructure: jobDetails.payStructure,
          // isOldListing: jobDetails.isOldListing,
          // state: jobDetails.state,
          // keywords: jobDetails.keywords
        });

        console.log(`These are the job Details: ${jobs.company}`);
      } catch (error) {
        console.error("Error extracting single job details:", error);
      }
    }
    // Job search results
  }

  return jobs;
}

// ======================
// UI Integration
// ======================
function injectTrackButton() {
  if (document.getElementById("gh-track-btn")) return;

  // LinkedIn specific injection
  if (window.location.href.includes("linkedin.com")) {
    const applyBtn = document.querySelector(".jobs-apply-button--top-card");
    if (!applyBtn) {
      setTimeout(injectTrackButton, 1000);
      return;
    }

    const trackBtn = document.createElement("button");
    trackBtn.id = "gh-track-btn";
    trackBtn.className = "jobs-apply-button--top-card artdeco-button artdeco-button--3";
    trackBtn.innerHTML = `
      <span class="artdeco-button__text">👻 Track Job</span>
    `;
    trackBtn.style.backgroundColor = "#27ae60";
    trackBtn.style.marginRight = "10px";

    applyBtn.parentNode.insertBefore(trackBtn, applyBtn);

    trackBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      trackBtn.disabled = true;
      trackBtn.innerHTML = `<span class="artdeco-button__text">⏳ Saving...</span>`;

      try {
        const jobData = scanPageForJobs()[0];
        const response = await chrome.runtime.sendMessage({
          action: "saveJob",
          job: jobData
        });
    
        if (response.error) throw new Error(response.error);
        trackBtn.innerHTML = `<span class="artdeco-button__text">✅ Tracked!</span>`;
      } catch (err) {
        trackBtn.innerHTML = `<span class="artdeco-button__text">❌ Failed: ${err.message}</span>`;
      } finally {
        setTimeout(() => {
          trackBtn.innerHTML = `<span class="artdeco-button__text">👻 Track Job</span>`;
          trackBtn.disabled = false;
        }, 2000);
      }
    });
  }
}

// ======================
// Initialization
// ======================
function initialize() {
  // Watch for dynamic page changes
  const observer = new MutationObserver(injectTrackButton);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial injection attempt
  injectTrackButton();
}

// Start the extension
initialize();
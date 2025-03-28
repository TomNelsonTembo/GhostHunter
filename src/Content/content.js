function scanPageForJobs() {
    console.log('Scanning page for jobs...');
    const jobs = [];
    const currentUrl = window.location.href;
    
    // LinkedIn job detection
    if (currentUrl.includes('linkedin.com/jobs')) {
      document.querySelectorAll('.jobs-search__results-list li').forEach(jobElement => {
        jobs.push({
          title: jobElement.querySelector('.job-card-title')?.innerText?.trim() || 'Untitled',
          company: jobElement.querySelector('.company-name')?.innerText?.trim() || 'Unknown',
          url: jobElement.querySelector('a')?.href || currentUrl,
          status: 'pending'
        });
      });
    }
    // Indeed job detection
    else if (currentUrl.includes('indeed.com')) {
      document.querySelectorAll('.jobListing').forEach(jobElement => {
        jobs.push({
          title: jobElement.querySelector('.jobTitle')?.innerText?.trim() || 'Untitled',
          company: jobElement.querySelector('.companyName')?.innerText?.trim() || 'Unknown',
          url: jobElement.querySelector('a')?.href || currentUrl,
          status: 'pending'
        });
      });
    }
    
    return jobs;
  }
  
  // Make function available to the extension
  window.scanPageForJobs = scanPageForJobs;
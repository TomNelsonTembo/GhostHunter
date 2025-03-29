function scanPageForJobs() {
  const jobs = [];
  const currentUrl = window.location.href;
  
  // LinkedIn job detection
  if (currentUrl.includes('linkedin.com/jobs')) {
    document.querySelectorAll('[data-job-id]').forEach(jobElement => {
      let titleElement = jobElement.querySelector('a.job-card-container__link span.visually-hidden');
      let companyElement = jobElement.querySelector('div.artdeco-entity-lockup__subtitle span');
      let locationElement = jobElement.querySelector('ul.job-card-container__metadata-wrapper li:first-child span');
      let linkElement = jobElement.querySelector('a.job-card-container__link');
  
      jobs.push({
        title: titleElement ? titleElement.innerText.trim() : 'Untitled',
        company: companyElement ? companyElement.innerText.trim() : 'Unknown',
        location: locationElement ? locationElement.innerText.trim() : 'Not specified',
        url: linkElement ? linkElement.href : currentUrl,
        status: 'pending',
        domain: 'linkedin'
      });
    });
  }
  // Indeed job detection
  else if (currentUrl.includes('indeed.com')) {
    document.querySelectorAll('.jobListing, [data-tk="main-job"]').forEach(jobElement => {
      jobs.push({
        title: jobElement.querySelector('.jobTitle, [id^="job_"] h2')?.innerText?.trim() || 'Untitled',
        company: jobElement.querySelector('.companyName, [data-testid="company-name"]')?.innerText?.trim() || 'Unknown',
        url: new URL(jobElement.querySelector('a')?.href || currentUrl, currentUrl).toString(),
        status: 'pending',
        domain: 'indeed'
      });
    });
  }
  
  return jobs;
}

// Make function available to extension
window.scanPageForJobs = scanPageForJobs;
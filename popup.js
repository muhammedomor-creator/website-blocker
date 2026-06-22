document.getElementById('saveBtn').addEventListener('click', () => {
  const sitesInput = document.getElementById('blockedSites').value;
  let redirectUrl = document.getElementById('redirectLink').value.trim();

  // ইউজার যদি লিংকের শুরুতে http বা https না দেয়, তবে তা স্বয়ংক্রিয়ভাবে যুক্ত করার লজিক
  if (redirectUrl && !/^https?:\/\//i.test(redirectUrl)) {
    redirectUrl = 'https://' + redirectUrl;
  }

  // কমা দিয়ে আলাদা করে লিস্ট বা অ্যারে তৈরি করা
  const sitesArray = sitesInput.split(',')
    .map(site => site.trim().toLowerCase())
    .filter(Boolean);

  // ব্রাউজার মেমরিতে সেভ করা
  chrome.storage.local.set({ 
    blockedSites: sitesArray, 
    redirectLink: redirectUrl || "https://google.com" 
  }, () => {
    const status = document.getElementById('statusMsg');
    status.style.display = 'block';
    setTimeout(() => {
      status.style.display = 'none';
    }, 2000);
  });
});

// আগে থেকে সেভ থাকা ডাটা পপ-আপ ওপেন হলে স্বয়ংক্রিয়ভাবে দেখানোর লজিক
chrome.storage.local.get(['blockedSites', 'redirectLink'], (data) => {
  if (data.blockedSites) {
    document.getElementById('blockedSites').value = data.blockedSites.join(', ');
  }
  if (data.redirectLink) {
    document.getElementById('redirectLink').value = data.redirectLink;
  }
});

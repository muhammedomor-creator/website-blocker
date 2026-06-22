// ব্লকিং রুলস আপডেট করার মেইন ফাংশন
async function updateBlockingRules() {
  const data = await chrome.storage.local.get(['blockedSites', 'redirectLink']);
  const blockedSites = data.blockedSites || [];
  const redirectLink = data.redirectLink || "https://google.com";

  // আগে থেকে থাকা পুরোনো রুলসগুলো মুছে ফেলা
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(rule => rule.id);
  
  const newRules = [];
  let idCounter = 1;

  // নতুন রুলস তৈরি করা প্রতিটি ব্লকড সাইটের জন্য
  blockedSites.forEach(site => {
    if (site) {
      newRules.push({
        id: idCounter++,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { url: redirectLink }
        },
        condition: {
          urlFilter: `*://*.${site}/*`,
          resourceTypes: ["main_frame"]
        }
      });
      
      // সাবডোমেন ছাড়া মেইন ডোমেনের জন্যও রুল যুক্ত করা
      newRules.push({
        id: idCounter++,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { url: redirectLink }
        },
        condition: {
          urlFilter: `*://${site}/*`,
          resourceTypes: ["main_frame"]
        }
      });
    }
  });

  // ব্রাউজারের সিস্টেমে নতুন রুলসগুলো লাইভ করা
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules
  });
}

// এক্সটেনশনটি প্রথমবার ইনস্টল হলে বা ব্রাউজার চালু হলে রুলস লোড হবে
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);

// যখনই ইউজার পপ-আপে নতুন সাইট সেভ করবে, তখনই ব্যাকগ্রাউন্ড রুলস আপডেট হবে
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites || changes.redirectLink) {
    updateBlockingRules();
  }
});

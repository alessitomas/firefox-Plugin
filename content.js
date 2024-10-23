// content.js

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.request === "gatherData") {
    getCookies(cookiesData => {
      const thirdPartyData = getThirdPartyDomains();
      const localStorageData = getLocalStorage();
      const sessionStorageData = getSessionStorageItems();
      const hijackingRisk = calculateHijackingRisk();
      const canvasFingerprinting = detectCanvasFingerprinting();
      const grade = calculateGrade(cookiesData, thirdPartyData, localStorageData, hijackingRisk, canvasFingerprinting);

      const data = {
        thirdPartyRequests: thirdPartyData.count,
        thirdPartyDomains: thirdPartyData.domains,
        cookiesCount: cookiesData.count,
        cookies: cookiesData.cookies,
        firstPartyCookies: cookiesData.firstPartyCookies,
        thirdPartyCookies: cookiesData.thirdPartyCookies,
        sessionCookies: cookiesData.sessionCookies,
        persistentCookies: cookiesData.persistentCookies,
        localStorageItemsCount: localStorageData.count,
        localStorageItems: localStorageData.items,
        sessionStorageItemsCount: sessionStorageData.count,
        sessionStorageItems: sessionStorageData.items,
        hijackingRisk: hijackingRisk,
        canvasFingerprinting: canvasFingerprinting,
        grade: grade
      };
      sendResponse(data);
    });
    return true; 
  }
});


function getCookies(callback) {
  browser.runtime.sendMessage({ request: "getCookies" }).then(cookies => {
    const firstPartyCookies = {};
    const thirdPartyCookies = {};
    const sessionCookies = {};
    const persistentCookies = {};

    cookies.forEach(cookie => {
      if (cookie.domain.includes(window.location.hostname)) {
        firstPartyCookies[cookie.name] = cookie.value;
      } else {
        thirdPartyCookies[cookie.name] = cookie.value;
      }

      if (cookie.session) {
        sessionCookies[cookie.name] = cookie.value;
      } else {
        persistentCookies[cookie.name] = cookie.value;
      }
    });

    callback({
      count: cookies.length,
      cookies: cookies,
      firstPartyCookies: firstPartyCookies,
      thirdPartyCookies: thirdPartyCookies,
      sessionCookies: sessionCookies,
      persistentCookies: persistentCookies
    });
  });
}


function extractDomain(url) {
  let domain;
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  domain = domain.split(':')[0];
  return domain;
}


function getThirdPartyDomains() {
  const thirdPartyDomains = new Set();
  const allElements = document.getElementsByTagName('*');

  for (let element of allElements) {
    if (['SCRIPT', 'IMG', 'IFRAME', 'LINK'].includes(element.tagName)) {
      const src = element.src || element.href;
      if (src) {
        const domain = extractDomain(src);
        if (domain && domain !== window.location.hostname) {
          thirdPartyDomains.add(domain);
        }
      }
    }
  }

  return {
    count: thirdPartyDomains.size,
    domains: Array.from(thirdPartyDomains)
  };
}


function getLocalStorage() {
  const items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    items[key] = localStorage.getItem(key);
  }
  return {
    count: Object.keys(items).length,
    items: items
  };
}


function getSessionStorageItems() {
  const items = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    items[key] = sessionStorage.getItem(key);
  }
  return {
    count: Object.keys(items).length,
    items: items
  };
}


function calculateHijackingRisk() {
  let risk = 0;

  
  if (window.location.protocol === 'https:') {
    risk += 0; 
  } else {
    risk += 5; 
  }

  // Verifica atributos dos cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    if (!cookie.includes('Secure')) {
      risk += 1; 
    }
    if (!cookie.includes('HttpOnly')) {
      risk += 1; 
    }
  });

  return risk;
}


function detectCanvasFingerprinting() {
  let isFingerprinting = false;

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function() {
    isFingerprinting = true;
    return originalGetImageData.apply(this, arguments);
  };

  
  setTimeout(() => {
    CanvasRenderingContext2D.prototype.getImageData = originalGetImageData;
  }, 5000);

  return isFingerprinting;
}


function calculateGrade(cookieData, thirdPartyData, localStorageData, hijackingRisk, canvasFingerprinting) {
  
  const weights = {
    cookies: 0.2,
    thirdParty: 0.2,
    localStorage: 0.2,
    hijacking: 0.2,
    fingerprinting: 0.2
  };

  
  const normalizedCookies = Math.min(cookieData.count / 50, 1);
  const normalizedThirdParty = Math.min(thirdPartyData.count / 20, 1);
  const normalizedLocalStorage = Math.min(localStorageData.count / 20, 1);
  const normalizedHijacking = Math.min(hijackingRisk / 10, 1);
  const normalizedFingerprinting = canvasFingerprinting ? 1 : 0;

  
  const weightedSum =
    normalizedCookies * weights.cookies +
    normalizedThirdParty * weights.thirdParty +
    normalizedLocalStorage * weights.localStorage +
    normalizedHijacking * weights.hijacking +
    normalizedFingerprinting * weights.fingerprinting;

  let grade = (1 - weightedSum) * 10; 
  grade = grade < 0 ? 0 : grade.toFixed(1);

  return grade;
}

// content.js

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === "gatherData") {
      const thirdPartyData = getThirdPartyDomains();
      const cookiesData = getCookies();
      const localStorageData = getLocalStorage();
      const sessionStorageData = getSessionStorageItems();
      const hijackingRisk = calculateHijackingRisk();
      const grade = calculateGrade();
  
      const data = {
        thirdPartyRequests: thirdPartyData.count,
        thirdPartyDomains: thirdPartyData.domains,
        cookiesCount: cookiesData.count,
        cookies: cookiesData.cookies,
        localStorageItemsCount: localStorageData.count,
        localStorageItems: localStorageData.items,
        sessionStorageItemsCount: sessionStorageData.count,
        sessionStorageItems: sessionStorageData.items,
        grade: grade,
        hijackingRisk: hijackingRisk,
      };
      sendResponse(data);
    }
  });
  
  // Função para obter os cookies
  function getCookies() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      acc[name] = value;
      return acc;
    }, {});
  
    return {
      count: Object.keys(cookies).length,
      cookies: cookies,
    };
  }
  
  // Função para extrair o domínio de uma URL
  function extractDomain(url) {
    let domain;
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    return domain;
  }
  
  // Função para obter domínios de terceiros
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
      domains: Array.from(thirdPartyDomains),
    };
  }
  
  // Função para obter itens do localStorage
  function getLocalStorage() {
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      items[key] = localStorage.getItem(key);
    }
    return {
      count: Object.keys(items).length,
      items: items,
    };
  }
  
  // Função para obter itens do sessionStorage
  function getSessionStorageItems() {
    const items = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      items[key] = sessionStorage.getItem(key);
    }
    return {
      count: Object.keys(items).length,
      items: items,
    };
  }
  
  // Função para calcular o risco de hijacking
  function calculateHijackingRisk() {
    let risk = 0;
  
    // Verifica se o site usa HTTPS
    if (window.location.protocol === 'https:') {
      risk += 0; // HTTPS reduz o risco
    } else {
      risk += 5; // HTTP aumenta o risco
    }
  
    // Verifica atributos dos cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      if (!cookie.includes('Secure')) {
        risk += 1; // Falta do atributo Secure aumenta o risco
      }
      if (!cookie.includes('HttpOnly')) {
        risk += 1; // Falta do atributo HttpOnly aumenta o risco
      }
    });
  
    return risk;
  }
  
  // Função para calcular a pontuação geral
  function calculateGrade() {
    const cookieData = getCookies();
    const thirdPartyData = getThirdPartyDomains();
    const localStorageData = getLocalStorage();
    const hijackingRisk = calculateHijackingRisk();
  
    // Pesos para cada componente
    const weights = {
      cookies: 0.3,
      thirdParty: 0.3,
      localStorage: 0.2,
      hijacking: 0.2,
    };
  
    // Normalização dos valores
    const normalizedCookies = Math.min(cookieData.count / 20, 1);
    const normalizedThirdParty = Math.min(thirdPartyData.count / 20, 1);
    const normalizedLocalStorage = Math.min(localStorageData.count / 20, 1);
    const normalizedHijacking = Math.min(hijackingRisk / 10, 1);
  
    // Cálculo da pontuação ponderada
    const weightedSum =
      normalizedCookies * weights.cookies +
      normalizedThirdParty * weights.thirdParty +
      normalizedLocalStorage * weights.localStorage +
      normalizedHijacking * weights.hijacking;
  
    let grade = (1 - weightedSum) * 10; // Escala de 0 a 10
    grade = grade < 0 ? 0 : grade.toFixed(1);
  
    return grade;
  }
  
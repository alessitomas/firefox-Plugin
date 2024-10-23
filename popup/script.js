

document.addEventListener('DOMContentLoaded', function () {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const currentTab = tabs[0];
    browser.runtime
      .sendMessage({ request: 'getData', tabId: currentTab.id })
      .then(updatePopup)
      .catch(error => console.error('Error:', error));
  });

  function updatePopup(response) {
    
    document.getElementById('grade').textContent = `${response.grade}`;

    
    window.securityData = response;
  }

  
  const accordionButtons = document.querySelectorAll('.accordion-button');
  accordionButtons.forEach(button => {
    button.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);

      const content = this.nextElementSibling;
      content.setAttribute('aria-hidden', isExpanded);

      if (!isExpanded && !content.innerHTML.trim()) {
        
        const sectionId = content.id;
        let detailContent = '';

        switch (sectionId) {
          case 'third_party':
            detailContent = formatThirdPartyDomains(window.securityData.thirdPartyDomains);
            break;
          case 'hijacking':
            detailContent = `Risco de Hijacking: ${window.securityData.hijackingRisk}`;
            break;
          case 'local_storage':
            detailContent = formatStorageItems(window.securityData.localStorageItems, 'Armazenamento Local');
            break;
          case 'cookies':
            detailContent = formatCookies(window.securityData);
            break;
          case 'canvas_fingerprint':
            detailContent = window.securityData.canvasFingerprinting
              ? 'Canvas Fingerprinting detectado.'
              : 'Nenhuma atividade de Canvas Fingerprinting detectada.';
            break;
          default:
            detailContent = 'Nenhuma informação disponível.';
        }

        content.innerHTML = detailContent;
      }
    });
  });

  
  function formatThirdPartyDomains(domains) {
    return `
      <p>Domínios de terceiros encontrados: ${domains.length}</p>
      <ul>${domains.map(domain => `<li>${domain}</li>`).join('')}</ul>
    `;
  }

  function formatStorageItems(items, storageType) {
    const keys = Object.keys(items);
    return `
      <p>${storageType} itens encontrados: ${keys.length}</p>
      <ul>${keys.map(key => `<li>${key}: ${items[key]}</li>`).join('')}</ul>
    `;
  }

  function formatCookies(data) {
    return `
      <p>Total de cookies: ${data.cookiesCount}</p>
      <p>Cookies de primeira parte: ${Object.keys(data.firstPartyCookies).length}</p>
      <p>Cookies de terceira parte: ${Object.keys(data.thirdPartyCookies).length}</p>
      <p>Cookies de sessão: ${Object.keys(data.sessionCookies).length}</p>
      <p>Cookies persistentes: ${Object.keys(data.persistentCookies).length}</p>
    `;
  }
});

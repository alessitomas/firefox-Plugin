// script.js

document.addEventListener('DOMContentLoaded', function () {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const currentTab = tabs[0];
      browser.runtime
        .sendMessage({ request: 'getData', tabId: currentTab.id })
        .then(updatePopup)
        .catch(error => console.error('Error:', error));
    });
  
    function updatePopup(response) {
      // Atualiza a pontuação
      document.getElementById('grade').textContent = `${response.grade}`;
  
      // Armazena os dados para uso posterior
      window.securityData = response;
    }
  
    // Adiciona ouvintes aos botões do acordeão
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
      button.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
  
        const content = this.nextElementSibling;
        content.setAttribute('aria-hidden', isExpanded);
  
        if (!isExpanded && !content.innerHTML.trim()) {
          // Preenche o conteúdo quando o acordeão é aberto pela primeira vez
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
              detailContent = formatStorageItems(window.securityData.localStorageItems, 'Local Storage');
              break;
            case 'cookies':
              detailContent = formatCookies(window.securityData.cookies);
              break;
            default:
              detailContent = 'Nenhuma informação disponível.';
          }
  
          content.innerHTML = detailContent;
        }
      });
    });
  
    // Funções auxiliares para formatar os dados
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
  
    function formatCookies(cookies) {
      const keys = Object.keys(cookies);
      return `
        <p>Cookies encontrados: ${keys.length}</p>
        <ul>${keys.map(key => `<li>${key}: ${cookies[key]}</li>`).join('')}</ul>
      `;
    }
  });
  
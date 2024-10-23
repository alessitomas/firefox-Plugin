// detectahacker.js

// Listener para mensagens do background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.request === 'gatherData') {
    // As funções necessárias já estão definidas em content.js
    // Você pode importar ou reutilizar as funções aqui se necessário
    sendResponse({ data: 'Data collected' });
  }
});

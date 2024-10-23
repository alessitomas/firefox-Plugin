
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.request === 'gatherData') {

    sendResponse({ data: 'Data collected' });
  }
});

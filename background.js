// background.js

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.request === "getData") {
    browser.tabs
      .sendMessage(message.tabId, { request: "gatherData" })
      .then(sendResponse)
      .catch(error => console.error('Error:', error));
    return true; // Indica que sendResponse será chamado de forma assíncrona
  }
});

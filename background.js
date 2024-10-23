

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.request === "getData") {
    browser.tabs
      .sendMessage(message.tabId, { request: "gatherData" })
      .then(sendResponse)
      .catch(error => console.error('Error:', error));
    return true; 
  } else if (message.request === "getCookies") {
    
    browser.cookies.getAll({ url: sender.url }).then(cookies => {
      sendResponse(cookies);
    });
    return true;
  }
});

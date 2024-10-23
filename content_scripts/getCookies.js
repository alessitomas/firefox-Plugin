function getCookies() {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    acc[name] = value;
    return acc;
  }, {});


  const firstPartyCookies = {};
  const thirdPartyCookies = {};
  const sessionCookies = {};
  const persistentCookies = {};

  for (const name in cookies) {
    
    firstPartyCookies[name] = cookies[name];

    sessionCookies[name] = cookies[name];
  }

  return {
    count: Object.keys(cookies).length,
    cookies: cookies,
    firstPartyCount: Object.keys(firstPartyCookies).length,
    thirdPartyCount: Object.keys(thirdPartyCookies).length,
    sessionCookiesCount: Object.keys(sessionCookies).length,
    persistentCookiesCount: Object.keys(persistentCookies).length,
    firstPartyCookies: firstPartyCookies,
    thirdPartyCookies: thirdPartyCookies,
    sessionCookies: sessionCookies,
    persistentCookies: persistentCookies
  };
}

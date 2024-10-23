// getCookies.js

document.addEventListener('DOMContentLoaded', function () {
    function getCookiesInfo() {
      const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        acc[name] = value;
        return acc;
      }, {});
  
      const cookieCount = Object.keys(cookies).length;
      const cookieList = Object.entries(cookies)
        .map(([name, value]) => `${name}: ${value}`)
        .join('\n');
  
      return `Encontrados ${cookieCount} cookies:\n${cookieList}`;
    }
  
    console.log(getCookiesInfo());
  });
  
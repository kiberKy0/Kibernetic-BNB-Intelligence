(() => {
  'use strict';
  // Eseguito nel documento iframe BNB dopo l'avvio di tutti i moduli storici.
  const nav = document.getElementById('hubNav');
  if (!nav || document.getElementById('xauUsdNav')) return;
  const button = document.createElement('button');
  button.id = 'xauUsdNav';
  button.type = 'button';
  const heading = document.createElement('b');
  heading.textContent = 'Oro XAU/USD';
  const detail = document.createElement('span');
  detail.textContent = 'Decoder separato';
  button.append(heading, detail);
  button.addEventListener('click', () => {
    window.top.location.href = '/xau-usd.html';
  });
  nav.appendChild(button);
})();

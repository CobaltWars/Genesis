const webview = document.getElementById('my-webview');
const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');

// Fonction pour vérifier si une chaîne est une URL valide
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Fonction pour formater l'URL ou créer une recherche Google
function formatURL(input) {
  if (isValidURL(input)) {
    return input;
  }
  
  // Si ce n'est pas une URL valide, vérifier si c'est un domaine simple
  if (input.includes('.') && !input.includes(' ')) {
    return 'https://' + input;
  }
  
  // Sinon, faire une recherche Google
  return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}

// Gestionnaire pour la barre d'URL
urlBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const url = formatURL(urlBar.value);
    webview.src = url;
  }
});

// Gestionnaires pour les boutons de navigation
backBtn.addEventListener('click', () => {
  if (webview.canGoBack()) {
    webview.goBack();
  }
});

forwardBtn.addEventListener('click', () => {
  if (webview.canGoForward()) {
    webview.goForward();
  }
});

reloadBtn.addEventListener('click', () => {
  webview.reload();
});

// Mettre à jour la barre d'URL quand la page change
webview.addEventListener('did-navigate', (e) => {
  urlBar.value = e.url;
});

webview.addEventListener('did-navigate-in-page', (e) => {
  urlBar.value = e.url;
});

// Mettre à jour l'état des boutons
webview.addEventListener('did-finish-load', () => {
  backBtn.disabled = !webview.canGoBack();
  forwardBtn.disabled = !webview.canGoForward();
});

// Initialiser l'état des boutons
webview.addEventListener('dom-ready', () => {
  backBtn.disabled = !webview.canGoBack();
  forwardBtn.disabled = !webview.canGoForward();
  urlBar.value = webview.src;
});


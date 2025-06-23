const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');
const tabsContainer = document.getElementById('tabs-container');
const addTabBtn = document.getElementById('add-tab-btn');
const webviewContainer = document.getElementById('webview-container');

let tabs = [];
let currentTabIndex = 0;

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
  
  if (input.includes('.') && !input.includes(' ')) {
    return 'https://' + input;
  }
  
  return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}

// Créer un nouvel onglet
function createTab(url = 'https://www.google.com') {
  const tabId = tabs.length;
  
  // Créer l'élément d'onglet
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.textContent = 'Nouvel onglet';
  tab.dataset.tabId = tabId;
  
  // Ajouter l'icône de fermeture
  const closeBtn = document.createElement('span');
  closeBtn.className = 'tab-close';
  closeBtn.innerHTML = '×';
  tab.appendChild(closeBtn);
  
  // Ajouter le favicon
  const favicon = document.createElement('img');
  favicon.className = 'tab-favicon';
  favicon.src = 'https://www.google.com/favicon.ico'; // Favicon par défaut
  tab.appendChild(favicon);
  
  // Créer le webview
  const webview = document.createElement('webview');
  webview.src = url;
  webview.dataset.tabId = tabId;
  
  // Gestionnaire pour le favicon
  webview.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons && e.favicons.length > 0) {
      const faviconUrl = e.favicons[0];
      updateTabFavicon(tabId, faviconUrl);
    }
  });
  
  // Gestionnaire pour le titre de la page
  webview.addEventListener('page-title-updated', (e) => {
    updateTabTitle(tabId, e.title);
  });
  
  // Ajouter des écouteurs d'événements pour le webview
  webview.addEventListener('did-navigate', (e) => {
    updateUrlBar(e.url);
    updateTabTitle(tabId, e.url);
  });
  
  webview.addEventListener('did-navigate-in-page', (e) => {
    updateUrlBar(e.url);
    updateTabTitle(tabId, e.url);
  });
  
  webview.addEventListener('did-finish-load', () => {
    updateNavButtons(tabId);
  });
  
  webview.addEventListener('dom-ready', () => {
    updateNavButtons(tabId);
    updateTabTitle(tabId, webview.src);
  });
  
  // Ajouter à la liste des onglets
  tabs.push({
    id: tabId,
    webview: webview,
    tabElement: tab,
    url: url,
    favicon: 'https://www.google.com/favicon.ico'
  });
  
  // Insérer l'onglet avant le bouton "+"
  tabsContainer.insertBefore(tab, addTabBtn);
  webviewContainer.appendChild(webview);
  
  // Activer le nouvel onglet
  switchTab(tabId);
  
  return tabId;
}

// Mettre à jour le favicon de l'onglet
function updateTabFavicon(tabId, faviconUrl) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  tab.favicon = faviconUrl;
  const favicon = tab.tabElement.querySelector('.tab-favicon');
  if (favicon) {
    favicon.src = faviconUrl;
  }
}

// Basculer vers un onglet spécifique
function switchTab(tabId) {
  tabs.forEach((tab, index) => {
    const isActive = tab.id === tabId;
    tab.tabElement.classList.toggle('active', isActive);
    tab.webview.classList.toggle('active', isActive);
    
    if (isActive) {
      currentTabIndex = index;
      updateUrlBar(tab.webview.src);
      updateNavButtons(tabId);
    }
  });
}

// Mettre à jour la barre d'URL
function updateUrlBar(url) {
  urlBar.value = url;
}

// Mettre à jour les boutons de navigation
function updateNavButtons(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  backBtn.disabled = !tab.webview.canGoBack();
  forwardBtn.disabled = !tab.webview.canGoForward();
}

// Mettre à jour le titre de l'onglet
function updateTabTitle(tabId, title) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  // Garder seulement le texte avant le tiret si présent (ex: "Google - Recherche" → "Google")
  const shortTitle = title.split(' - ')[0];
  tab.tabElement.textContent = shortTitle || `Onglet ${tabId + 1}`;
}

// Fermer un onglet
function closeTab(tabId, event) {
  event.stopPropagation(); // Empêcher le basculement vers l'onglet
  
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;
  
  // Supprimer les éléments DOM
  tabs[tabIndex].tabElement.remove();
  tabs[tabIndex].webview.remove();
  
  // Supprimer de la liste
  tabs.splice(tabIndex, 1);
  
  // Si on ferme l'onglet actif, basculer vers un autre onglet
  if (currentTabIndex === tabIndex) {
    const newIndex = Math.min(currentTabIndex, tabs.length - 1);
    if (tabs.length > 0) {
      switchTab(tabs[newIndex].id);
    } else {
      // Si plus d'onglets, en créer un nouveau
      createTab();
    }
  } else if (currentTabIndex > tabIndex) {
    // Ajuster l'index courant si nécessaire
    currentTabIndex--;
  }
  
  // Réattribuer les IDs si nécessaire (optionnel)
  // tabs.forEach((tab, index) => { tab.id = index; });
}

// Gestionnaire pour la barre d'URL
urlBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const currentTab = tabs[currentTabIndex];
    if (!currentTab) return;
    
    const url = formatURL(urlBar.value);
    currentTab.webview.src = url;
  }
});

// Gestionnaires pour les boutons de navigation
backBtn.addEventListener('click', () => {
  const currentTab = tabs[currentTabIndex];
  if (currentTab && currentTab.webview.canGoBack()) {
    currentTab.webview.goBack();
  }
});

forwardBtn.addEventListener('click', () => {
  const currentTab = tabs[currentTabIndex];
  if (currentTab && currentTab.webview.canGoForward()) {
    currentTab.webview.goForward();
  }
});

reloadBtn.addEventListener('click', () => {
  const currentTab = tabs[currentTabIndex];
  if (currentTab) {
    currentTab.webview.reload();
  }
});

// Gestionnaire pour le bouton d'ajout d'onglet
addTabBtn.addEventListener('click', () => {
  createTab();
});

// Gestionnaire pour cliquer sur un onglet
tabsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab')) {
    const tabId = parseInt(e.target.dataset.tabId);
    switchTab(tabId);
  }
});

// Gestionnaire pour le bouton de fermeture d'onglet
tabsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-close')) {
    const tabId = parseInt(e.target.parentElement.dataset.tabId);
    closeTab(tabId, e);
  } else if (e.target.classList.contains('tab')) {
    const tabId = parseInt(e.target.dataset.tabId);
    switchTab(tabId);
  }
});

// Raccourci clavier Ctrl+T
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    createTab();
  }
});

// Créer le premier onglet au chargement
createTab();
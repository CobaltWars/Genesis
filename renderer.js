const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');
const tabsContainer = document.getElementById('tabs-container');
const addTabBtn = document.getElementById('add-tab-btn');
const webviewContainer = document.getElementById('webview-container');

let tabs = [];
let currentTabIndex = 0;

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function formatURL(input) {
  if (isValidURL(input)) {
    return input;
  }
  
  if (input.includes('.') && !input.includes(' ')) {
    return 'https://' + input;
  }
  
  return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}

function createTab(url = 'https://www.google.com') {
  const tabId = tabs.length;
  
  // Créer l'élément d'onglet
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.tabId = tabId;
  
  // Ajouter le titre
  const titleSpan = document.createElement('span');
  titleSpan.className = 'tab-title';
  titleSpan.textContent = 'Nouvel onglet';
  tab.appendChild(titleSpan);
  
  // Ajouter le bouton de fermeture
  const closeBtn = document.createElement('span');
  closeBtn.className = 'tab-close';
  closeBtn.innerHTML = '×';
  tab.appendChild(closeBtn);
  
  // Ajouter le favicon
  const favicon = document.createElement('img');
  favicon.className = 'tab-favicon';
  favicon.src = 'https://www.google.com/favicon.ico';
  tab.appendChild(favicon);
  
  // Créer le webview
  const webview = document.createElement('webview');
  webview.src = url;
  webview.dataset.tabId = tabId;
  
  // Écouteurs d'événements
  webview.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons && e.favicons.length > 0) {
      updateTabFavicon(tabId, e.favicons[0]);
    }
  });
  
  webview.addEventListener('page-title-updated', (e) => {
    updateTabTitle(tabId, e.title);
  });
  
  webview.addEventListener('did-navigate', (e) => {
    updateUrlBar(e.url);
  });
  
  webview.addEventListener('did-navigate-in-page', (e) => {
    updateUrlBar(e.url);
  });
  
  webview.addEventListener('did-finish-load', () => {
    updateNavButtons(tabId);
  });
  
  webview.addEventListener('dom-ready', () => {
    updateNavButtons(tabId);
  });
  
  // Ajouter à la liste des onglets
  tabs.push({
    id: tabId,
    webview: webview,
    tabElement: tab,
    titleElement: titleSpan,
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

function updateUrlBar(url) {
  urlBar.value = url;
}

function updateNavButtons(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  backBtn.disabled = !tab.webview.canGoBack();
  forwardBtn.disabled = !tab.webview.canGoForward();
}

function updateTabTitle(tabId, title) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  // Nettoyer le titre
  let cleanTitle = title;
  const separatorIndex = title.indexOf(' - ');
  if (separatorIndex > -1) {
    cleanTitle = title.substring(0, separatorIndex);
  }
  
  // Si c'est une URL, prendre le domaine
  if (isValidURL(cleanTitle)) {
    try {
      const urlObj = new URL(cleanTitle);
      cleanTitle = urlObj.hostname.replace('www.', '');
    } catch (e) {
      // Garder le titre original si l'URL est invalide
    }
  }
  
  tab.titleElement.textContent = cleanTitle || `Onglet ${tabId + 1}`;
}

function updateTabFavicon(tabId, faviconUrl) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  tab.favicon = faviconUrl;
  const favicon = tab.tabElement.querySelector('.tab-favicon');
  if (favicon) {
    favicon.src = faviconUrl;
  }
}

function closeTab(tabId, event) {
  event.stopPropagation();
  
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;
  
  // Supprimer les éléments DOM
  tabs[tabIndex].tabElement.remove();
  tabs[tabIndex].webview.remove();
  
  // Supprimer de la liste
  tabs.splice(tabIndex, 1);
  
  // Gérer l'onglet actif
  if (currentTabIndex === tabIndex) {
    const newIndex = Math.min(currentTabIndex, tabs.length - 1);
    if (tabs.length > 0) {
      switchTab(tabs[newIndex].id);
    } else {
      window.electronAPI.closeWindow();
    }
  } else if (currentTabIndex > tabIndex) {
    currentTabIndex--;
  }
}

// Écouteurs d'événements
urlBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const currentTab = tabs[currentTabIndex];
    if (!currentTab) return;
    
    const url = formatURL(urlBar.value);
    currentTab.webview.src = url;
  }
});

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

addTabBtn.addEventListener('click', () => {
  createTab();
});

// Modifiez le gestionnaire d'événements pour les onglets
tabsContainer.addEventListener('click', (e) => {
  // Gestion du bouton de fermeture
  if (e.target.classList.contains('tab-close')) {
    const tabId = parseInt(e.target.parentElement.dataset.tabId);
    closeTab(tabId, e);
    return;
  }
  
  // Gestion du clic sur l'onglet (y compris ses enfants)
  let tabElement = e.target;
  while (tabElement && !tabElement.classList.contains('tab')) {
    tabElement = tabElement.parentElement;
    if (!tabElement) return;
  }
  
  if (tabElement.classList.contains('tab')) {
    const tabId = parseInt(tabElement.dataset.tabId);
    switchTab(tabId);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    createTab();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'w' && tabs.length > 0) {
    e.preventDefault();
    closeTab(tabs[currentTabIndex].id, { stopPropagation: () => {} });
  }
});

// Window controls
const maximizeBtn = document.getElementById('maximize-btn');

document.getElementById('minimize-btn').addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

maximizeBtn.addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

// Gérer le changement d'état de la fenêtre
window.electronAPI.onWindowStateChanged((event, state) => {
  if (state === 'maximized') {
    maximizeBtn.textContent = '🗗'; // Icône de restauration
    maximizeBtn.classList.add('restore');
  } else {
    maximizeBtn.textContent = '□'; // Icône de maximisation
    maximizeBtn.classList.remove('restore');
  }
});

// Créer le premier onglet au démarrage
createTab();
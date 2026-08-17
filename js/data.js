const DB_KEYS = {
  USERS: "serverColab_users",
  SESSION: "serverColab_session",
  SERVERS: "serverColab_servers"
};

function scGetUsers() {
  return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || "[]");
}

function scSaveUsers(users) {
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
}

function scGetSession() {
  return JSON.parse(localStorage.getItem(DB_KEYS.SESSION) || "null");
}

function scSetSession(session) {
  localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
}

function scLogout() {
  localStorage.removeItem(DB_KEYS.SESSION);
  window.location.href = "index.html";
}

function scRequireSession() {
  const session = scGetSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

function scGetServers() {
  return JSON.parse(localStorage.getItem(DB_KEYS.SERVERS) || "[]");
}

function scSaveServers(servers) {
  localStorage.setItem(DB_KEYS.SERVERS, JSON.stringify(servers));
}

function scGetServerById(id) {
  return scGetServers().find(s => s.id === id) || null;
}

function scUpdateServer(id, patch) {
  const servers = scGetServers();
  const idx = servers.findIndex(s => s.id === id);
  if (idx === -1) return null;
  servers[idx] = { ...servers[idx], ...patch };
  scSaveServers(servers);
  return servers[idx];
}

function scSlug(name) {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

function scUid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function scRandomPort() {
  return 25000 + Math.floor(Math.random() * 4000);
}

function scRandomIp() {
  return `playit-${Math.random().toString(36).slice(2, 8)}.joinmc.link`;
}

function scToast(message, type = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .25s";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function scSeedServersIfEmpty(ownerEmail) {
  const servers = scGetServers();
  if (servers.length > 0) return;
  const seed = [
    {
      id: scUid("srv"),
      owner: ownerEmail,
      displayName: "Reino Esmeralda",
      realName: scSlug("Reino Esmeralda"),
      logo: "img/logo.jpg",
      edition: "Java",
      core: "Paper",
      version: "1.20.1",
      ramLimitMb: 4096,
      maxPlayers: 20,
      onlinePlayers: 3,
      status: "online",
      ip: scRandomIp(),
      port: scRandomPort(),
      storageUsedGb: 2.1,
      storageLimitGb: 10,
      onlineMode: true,
      viewDistance: 8,
      simulationDistance: 6,
      difficulty: "normal",
      createdAt: Date.now(),
      driveConnected: true,
      console: [
        "[Servidor] Iniciando ServerColab bridge...",
        "[Servidor] Montando Google Drive...",
        "[Servidor] Descargando core Paper 1.20.1...",
        "[Playit] Túnel activo, esperando conexiones...",
        "[Servidor] Listo (1024ms)"
      ]
    }
  ];
  scSaveServers(seed);
}

function scIcon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    console: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/></svg>',
    files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>',
    plugin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v4M5 8h14l-1 5a6 6 0 0 1-12 0Z"/><path d="M9 17v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    google: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.47c-.28 1.5-1.13 2.77-2.41 3.62v3h3.9c2.28-2.1 3.54-5.2 3.54-8.8Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.9-3c-1.08.73-2.46 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.92H1.28v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.32 14.34a7.2 7.2 0 0 1 0-4.68v-3.1H1.28a12 12 0 0 0 0 10.88l4.04-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.56l4.04 3.1C6.26 6.85 8.89 4.77 12 4.77Z"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><path fill="#0066DA" d="m7.7 2.7 8.6 0 4.9 8.5-4.3 7.4h-8.6z" opacity="0"/><path fill="#00AC47" d="M7.7 2.7 1 14.3l3.3 5.7 6.7-11.6Z"/><path fill="#EA4335" d="M16.3 2.7H7.7l6.7 11.7h8.6Z"/><path fill="#00832D" d="m4.3 20 3.3-5.7h8.6L13 20Z"/><path fill="#2684FC" d="M11 8.7 14.3 14.3H23L19.6 8.7Z"/><path fill="#FFBA00" d="M4.3 20h8.7l3.3-5.7H7.6Z"/></svg>'
  };
  return icons[name] || "";
}

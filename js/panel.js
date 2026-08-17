const session = scRequireSession();

document.getElementById("avatarBtn").innerHTML = scIcon("user");
document.getElementById("mobileSidebarToggle").innerHTML = scIcon("menu");
document.getElementById("collapseSidebarBtn").innerHTML = scIcon("menu");
document.getElementById("plusIconSlot").innerHTML = scIcon("plus");
document.getElementById("emptyState").querySelector(".empty-state__icon").innerHTML = scIcon("home");
document.getElementById("driveConnectBox").querySelector(".perm-icon").innerHTML = scIcon("drive");

const sidebarLinks = document.querySelectorAll(".sidebar__link");
sidebarLinks[0].innerHTML = `${scIcon("home")}<span class="label">Inicio</span>`;
document.getElementById("openCreateModalLink").innerHTML = `${scIcon("plus")}<span class="label">Crear servidor</span>`;
document.getElementById("accountLink").innerHTML = `${scIcon("user")}<span class="label">Cuenta</span>`;
document.getElementById("logoutBtn").innerHTML = `${scIcon("back")}<span class="label">Cerrar sesión</span>`;

document.getElementById("welcomeTitle").textContent = `Hola, ${session.username}`;
document.getElementById("welcomeSubtitle").textContent = session.driveConnected
  ? "Google Drive conectado — tus servidores se guardan en tu cuenta."
  : "Conecta tu Google Drive para poder crear servidores.";

document.getElementById("logoutBtn").addEventListener("click", scLogout);
document.getElementById("accountLink").addEventListener("click", () => {
  scToast(`Sesión iniciada como ${session.email}`);
});

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

document.getElementById("collapseSidebarBtn").addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

function openMobileSidebar() {
  sidebar.classList.add("mobile-open");
  sidebarOverlay.hidden = false;
}
function closeMobileSidebar() {
  sidebar.classList.remove("mobile-open");
  sidebarOverlay.hidden = true;
}
document.getElementById("mobileSidebarToggle").addEventListener("click", openMobileSidebar);
document.getElementById("avatarBtn").addEventListener("click", () => {
  if (window.innerWidth <= 860) openMobileSidebar();
});
sidebarOverlay.addEventListener("click", closeMobileSidebar);

function scRenderStorageStrip() {
  const servers = scGetServers().filter(s => s.owner === session.email);
  const used = servers.reduce((sum, s) => sum + s.storageUsedGb, 0);
  const limit = SERVERCOLAB_CONFIG.DRIVE_STORAGE_LIMIT_GB;
  const pct = Math.min(100, (used / limit) * 100);
  document.getElementById("storageStrip").innerHTML = `
    <span>Almacenamiento en Drive</span>
    <div class="storage-strip__bar"><div class="storage-strip__fill" style="width:${pct}%"></div></div>
    <span>${used.toFixed(1)} GB / ${limit} GB</span>
    <span>${servers.length} servidor(es)</span>
  `;
}

function scServerCardHtml(server) {
  const statusMap = {
    online: { cls: "badge-on", label: "En línea", dotColor: "var(--accent)" },
    offline: { cls: "badge-off", label: "Apagado", dotColor: "var(--text-faint)" },
    starting: { cls: "badge-starting", label: "Iniciando", dotColor: "var(--amber)" }
  };
  const st = statusMap[server.status] || statusMap.offline;
  return `
    <article class="server-card" data-id="${server.id}">
      <div class="server-card__top">
        <img class="server-card__logo" src="${server.logo}" onerror="this.src='img/logo.jpg'" alt="${server.displayName}">
        <div class="server-card__names">
          <div class="server-card__name">${server.displayName}</div>
          <div class="server-card__slug">#${server.realName}</div>
        </div>
      </div>
      <div class="server-card__status">
        <span class="badge ${st.cls}"><span class="dot ${server.status === 'online' ? 'pulse' : ''}" style="color:${st.dotColor}"></span>${st.label}</span>
      </div>
      <div class="server-card__stats">
        <div class="stat-chip">
          <div class="stat-chip__label">RAM</div>
          <div class="stat-chip__value">${server.ramLimitMb} MB</div>
        </div>
        <div class="stat-chip">
          <div class="stat-chip__label">Jugadores</div>
          <div class="stat-chip__value">${server.onlinePlayers}/${server.maxPlayers}</div>
        </div>
      </div>
      <div class="server-card__tags">
        <span class="tag tag-edition">${server.edition}</span>
        <span class="tag">${server.core}</span>
        <span class="tag">MC ${server.version}</span>
      </div>
    </article>
  `;
}

function scRenderServers() {
  const servers = scGetServers().filter(s => s.owner === session.email);
  const grid = document.getElementById("serversGrid");
  const empty = document.getElementById("emptyState");
  if (servers.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = servers.map(scServerCardHtml).join("");
    grid.querySelectorAll(".server-card").forEach(card => {
      card.addEventListener("click", () => {
        const server = scGetServerById(card.dataset.id);
        window.location.href = `sv/panel.html?id=${server.id}&name=${encodeURIComponent(server.realName)}`;
      });
    });
  }
  scRenderStorageStrip();
}
scRenderServers();

const createModal = document.getElementById("createModal");
const driveConnectBox = document.getElementById("driveConnectBox");
const submitCreateBtn = document.getElementById("submitCreateBtn");

function scOpenCreateModal() {
  createModal.hidden = false;
  driveConnectBox.hidden = session.driveConnected;
  submitCreateBtn.disabled = !session.driveConnected;
  closeMobileSidebar();
}
document.getElementById("openCreateModalBtn").addEventListener("click", scOpenCreateModal);
document.getElementById("openCreateModalLink").addEventListener("click", scOpenCreateModal);
document.getElementById("emptyCreateBtn").addEventListener("click", scOpenCreateModal);
document.getElementById("closeCreateModal").addEventListener("click", () => createModal.hidden = true);
document.getElementById("cancelCreateBtn").addEventListener("click", () => createModal.hidden = true);

document.getElementById("connectDriveBtn").addEventListener("click", () => {
  if (SERVERCOLAB_CONFIG.GOOGLE_CLIENT_ID.startsWith("[AQUI")) {
    scToast("Falta configurar GOOGLE_CLIENT_ID en js/config.js", "error");
  }
  session.driveConnected = true;
  scSetSession(session);
  driveConnectBox.hidden = true;
  submitCreateBtn.disabled = false;
  scToast("Google Drive conectado correctamente");
});

const srvName = document.getElementById("srvName");
const slugPreview = document.getElementById("slugPreview");
srvName.addEventListener("input", () => {
  slugPreview.textContent = `#${scSlug(srvName.value) || "nombre_del_servidor"}`;
});

const srvRam = document.getElementById("srvRam");
const ramValue = document.getElementById("ramValue");
srvRam.addEventListener("input", () => {
  ramValue.textContent = `${srvRam.value} MB`;
});

document.getElementById("createServerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!session.driveConnected) {
    scToast("Conecta Google Drive antes de crear el servidor", "error");
    return;
  }
  const displayName = srvName.value.trim();
  if (!displayName) return;

  const newServer = {
    id: scUid("srv"),
    owner: session.email,
    displayName,
    realName: scSlug(displayName),
    logo: "img/logo.jpg",
    edition: document.getElementById("srvEdition").value,
    core: document.getElementById("srvCore").value,
    version: document.getElementById("srvVersion").value.trim() || "1.20.1",
    ramLimitMb: Number(srvRam.value),
    maxPlayers: Number(document.getElementById("srvMaxPlayers").value) || 20,
    onlinePlayers: 0,
    status: "offline",
    ip: scRandomIp(),
    port: scRandomPort(),
    storageUsedGb: 0.1,
    storageLimitGb: 10,
    onlineMode: true,
    viewDistance: 8,
    simulationDistance: 6,
    difficulty: "normal",
    createdAt: Date.now(),
    driveConnected: true,
    console: [
      "[ServerColab] Servidor creado desde el panel.",
      `[ServerColab] Notebook enlazado: ${SERVERCOLAB_CONFIG.COLAB_NOTEBOOK_DRIVE_PATH}`,
      "[ServerColab] Esperando primer inicio..."
    ]
  };

  const servers = scGetServers();
  servers.push(newServer);
  scSaveServers(servers);

  createModal.hidden = true;
  scToast(`Servidor "${displayName}" creado`);
  scRenderServers();
  e.target.reset();
  slugPreview.textContent = "#nombre_del_servidor";
  ramValue.textContent = "4096 MB";
});

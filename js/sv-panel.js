const session = scRequireSession();

const params = new URLSearchParams(window.location.search);
const serverId = params.get("id");
let server = serverId ? scGetServerById(serverId) : null;

if (!server) {
  window.location.href = "../panel.html";
}

if (!server.files) {
  server.files = {
    mods: [{ name: "no_hay_archivos.txt", size: "0 KB" }],
    plugins: [{ name: "no_hay_archivos.txt", size: "0 KB" }],
    world: [
      { name: "level.dat", size: "12 KB" },
      { name: "region", size: "640 MB" }
    ],
    config: [
      { name: "server.properties", size: "2 KB" },
      { name: "eula.txt", size: "1 KB" }
    ]
  };
  scUpdateServer(server.id, { files: server.files });
}

if (!server.plugins) {
  server.plugins = [];
  scUpdateServer(server.id, { plugins: server.plugins });
}

document.getElementById("backLink").innerHTML = scIcon("back");
document.getElementById("mobileSidebarToggle").innerHTML = scIcon("menu");
document.getElementById("collapseSidebarBtn").innerHTML = scIcon("menu");
document.getElementById("avatarBtn").innerHTML = scIcon("user");
document.getElementById("logoutBtn").innerHTML = `${scIcon("back")}<span class="label">Cerrar sesión</span>`;
document.getElementById("logoutBtn").addEventListener("click", scLogout);

const navIcons = { inicio: "home", consola: "console", archivos: "files", mundo: "world", complementos: "plugin", configuracion: "settings" };
const navLabels = { inicio: "Inicio", consola: "Consola", archivos: "Archivos", mundo: "Mundo", complementos: "Complementos", configuracion: "Configuración" };
document.querySelectorAll(".sidebar__link[data-view]").forEach(btn => {
  const v = btn.dataset.view;
  btn.innerHTML = `${scIcon(navIcons[v])}<span class="label">${navLabels[v]}</span>`;
});

document.getElementById("svSidebarServer").innerHTML = `
  <div class="sv-sidebar__server-name">${server.displayName}</div>
  <div class="sv-sidebar__server-slug">#${server.realName}</div>
`;

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
document.getElementById("collapseSidebarBtn").addEventListener("click", () => sidebar.classList.toggle("collapsed"));
function openMobileSidebar() { sidebar.classList.add("mobile-open"); sidebarOverlay.hidden = false; }
function closeMobileSidebar() { sidebar.classList.remove("mobile-open"); sidebarOverlay.hidden = true; }
document.getElementById("mobileSidebarToggle").addEventListener("click", openMobileSidebar);
document.getElementById("avatarBtn").addEventListener("click", () => { if (window.innerWidth <= 860) openMobileSidebar(); });
sidebarOverlay.addEventListener("click", closeMobileSidebar);

document.querySelectorAll(".sidebar__link[data-view]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar__link[data-view]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".sv-view").forEach(sec => {
      sec.hidden = sec.dataset.viewPanel !== btn.dataset.view;
    });
    closeMobileSidebar();
  });
});

function scRenderHeader() {
  document.getElementById("svLogo").src = server.logo;
  document.getElementById("svLogo").onerror = function () { this.src = "../img/logo.jpg"; };
  document.getElementById("svName").textContent = server.displayName;
  document.getElementById("svSlug").textContent = `#${server.realName}`;
  document.getElementById("svIp").textContent = server.ip;
  document.getElementById("svPort").textContent = server.port;

  const statusMap = {
    online: { cls: "badge-on", label: "En línea" },
    offline: { cls: "badge-off", label: "Apagado" },
    starting: { cls: "badge-starting", label: "Iniciando" }
  };
  const st = statusMap[server.status] || statusMap.offline;
  const badge = document.getElementById("svStatusBadge");
  badge.className = `badge ${st.cls}`;
  badge.innerHTML = `<span class="dot ${server.status === 'online' ? 'pulse' : ''}"></span>${st.label}`;

  const powerBtn = document.getElementById("powerBtn");
  if (server.status === "online") {
    powerBtn.className = "btn btn-danger";
    powerBtn.innerHTML = `${scIcon("stop")} Apagar servidor`;
  } else if (server.status === "starting") {
    powerBtn.className = "btn btn-outline";
    powerBtn.innerHTML = `Iniciando...`;
    powerBtn.disabled = true;
  } else {
    powerBtn.className = "btn btn-primary";
    powerBtn.innerHTML = `${scIcon("play")} Encender servidor`;
    powerBtn.disabled = false;
  }

  document.getElementById("ovRam").textContent = `${server.ramLimitMb} MB`;
  document.getElementById("ovPlayers").textContent = `${server.onlinePlayers} / ${server.maxPlayers}`;
  document.getElementById("ovCore").textContent = `${server.edition} · ${server.core}`;
  document.getElementById("ovVersion").textContent = server.version;

  const pct = Math.min(100, (server.storageUsedGb / server.storageLimitGb) * 100);
  document.getElementById("ovStorageFill").style.width = `${pct}%`;
  document.getElementById("ovStorageText").textContent = `${server.storageUsedGb.toFixed(1)} GB usados de ${server.storageLimitGb} GB`;
  document.getElementById("ovNotebookPath").textContent = SERVERCOLAB_CONFIG.COLAB_NOTEBOOK_DRIVE_PATH;
}
scRenderHeader();

document.getElementById("copyIpBtn").innerHTML = `${scIcon("copy")} Copiar`;
document.getElementById("copyIpBtn").addEventListener("click", () => {
  const text = `${server.ip}:${server.port}`;
  navigator.clipboard?.writeText(text).catch(() => {});
  scToast(`Copiado: ${text}`);
});

function scAppendConsole(line) {
  server.console.push(line);
  scUpdateServer(server.id, { console: server.console });
  const log = document.getElementById("consoleLog");
  const div = document.createElement("div");
  div.textContent = line;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function scRenderConsole() {
  const log = document.getElementById("consoleLog");
  log.innerHTML = "";
  server.console.forEach(line => {
    const div = document.createElement("div");
    div.textContent = line;
    log.appendChild(div);
  });
  log.scrollTop = log.scrollHeight;
}
scRenderConsole();

document.getElementById("consoleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("consoleCmd");
  const cmd = input.value.trim();
  if (!cmd) return;
  scAppendConsole(`> ${cmd}`);
  input.value = "";
  setTimeout(() => scAppendConsole(`[Servidor] Comando "${cmd}" ejecutado.`), 300);
});

document.getElementById("powerBtn").addEventListener("click", () => {
  if (server.status === "online") {
    server = scUpdateServer(server.id, { status: "offline", onlinePlayers: 0 });
    scAppendConsole("[Servidor] Deteniendo servidor...");
    scAppendConsole("[Servidor] Sesión de Colab liberada.");
    scRenderHeader();
    scToast("Servidor detenido");
    return;
  }

  server = scUpdateServer(server.id, { status: "starting" });
  scRenderHeader();
  scAppendConsole("[ServerColab] Conectando con Google Colab...");
  scAppendConsole(`[ServerColab] Ejecutando ${SERVERCOLAB_CONFIG.COLAB_NOTEBOOK_DRIVE_PATH}`);
  scAppendConsole("[ServerColab] Montando Google Drive...");

  setTimeout(() => {
    scAppendConsole("[Playit] Ingresa tu Secret Key cuando el cuaderno la solicite.");
    scAppendConsole(`[Playit] Túnel listo en ${server.ip}:${server.port}`);
    scAppendConsole("[Servidor] ¡Listo! Servidor en línea.");
    server = scUpdateServer(server.id, { status: "online", onlinePlayers: Math.floor(Math.random() * server.maxPlayers * 0.4) });
    scRenderHeader();
    scToast("Servidor en línea");
  }, 1800);
});

const folderLabels = { mods: "/mods", plugins: "/plugins", world: "/world", config: "/config" };
let currentFolder = server.edition === "Bedrock" ? "world" : (server.core === "Paper" ? "plugins" : "mods");

document.getElementById("filesTree").innerHTML = Object.keys(folderLabels).map(key => `
  <div class="files-tree__item ${key === currentFolder ? 'active' : ''}" data-folder="${key}">
    ${scIcon("folder")} ${folderLabels[key]}
  </div>
`).join("");

function scRenderFiles() {
  document.getElementById("filesCurrentFolder").textContent = folderLabels[currentFolder];
  document.querySelectorAll(".files-tree__item").forEach(el => {
    el.classList.toggle("active", el.dataset.folder === currentFolder);
  });
  const listBody = document.getElementById("filesListBody");
  const items = server.files[currentFolder] || [];
  if (items.length === 0) {
    listBody.innerHTML = `<div class="files-empty">Esta carpeta está vacía</div>`;
    return;
  }
  listBody.innerHTML = items.map((f, i) => `
    <div class="file-row">
      <div class="file-row__left">${scIcon("file")}<span>${f.name}</span></div>
      <div class="file-row__actions">
        <span class="file-row__size">${f.size}</span>
        <button data-index="${i}" class="deleteFileBtn">${scIcon("trash")}</button>
      </div>
    </div>
  `).join("");
  listBody.querySelectorAll(".deleteFileBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      server.files[currentFolder].splice(Number(btn.dataset.index), 1);
      scUpdateServer(server.id, { files: server.files });
      scRenderFiles();
      scToast("Archivo eliminado");
    });
  });
}
scRenderFiles();

document.querySelectorAll(".files-tree__item").forEach(el => {
  el.addEventListener("click", () => {
    currentFolder = el.dataset.folder;
    scRenderFiles();
  });
});

document.getElementById("uploadFileBtn").innerHTML = `${scIcon("plus")} Subir archivo`;
document.getElementById("uploadFileBtn").addEventListener("click", () => {
  const name = prompt("Nombre del archivo a subir (ej. worldedit.jar):");
  if (!name) return;
  server.files[currentFolder].push({ name, size: `${(Math.random() * 8 + 1).toFixed(1)} MB` });
  scUpdateServer(server.id, { files: server.files });
  scRenderFiles();
  scToast(`${name} subido a ${folderLabels[currentFolder]}`);
});

document.getElementById("backupWorldBtn").addEventListener("click", () => {
  document.getElementById("worldBackup").textContent = new Date().toLocaleString("es-ES");
  scToast("Copia de seguridad creada");
});
document.getElementById("downloadWorldBtn").addEventListener("click", () => {
  scToast("Preparando descarga desde Google Drive...");
});
document.getElementById("resetWorldBtn").addEventListener("click", () => {
  if (confirm("Esto borrará el mundo actual. ¿Continuar?")) {
    scToast("Mundo reiniciado", "error");
  }
});

document.getElementById("addPluginBtn").innerHTML = `${scIcon("plus")} Añadir`;
function scRenderPlugins() {
  const list = document.getElementById("pluginsList");
  document.getElementById("pluginsTitle").textContent = server.core === "Paper" ? "Plugins instalados" : "Mods instalados";
  if (server.plugins.length === 0) {
    list.innerHTML = `<div class="files-empty">Aún no has añadido complementos</div>`;
    return;
  }
  list.innerHTML = server.plugins.map((p, i) => `
    <div class="file-row">
      <div class="file-row__left">${scIcon("plugin")}<span>${p}</span></div>
      <div class="file-row__actions">
        <button data-index="${i}" class="removePluginBtn">${scIcon("trash")}</button>
      </div>
    </div>
  `).join("");
  list.querySelectorAll(".removePluginBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      server.plugins.splice(Number(btn.dataset.index), 1);
      scUpdateServer(server.id, { plugins: server.plugins });
      scRenderPlugins();
    });
  });
}
scRenderPlugins();
document.getElementById("addPluginBtn").addEventListener("click", () => {
  const name = prompt("Nombre del mod o plugin:");
  if (!name) return;
  server.plugins.push(name);
  scUpdateServer(server.id, { plugins: server.plugins });
  scRenderPlugins();
  scToast(`${name} añadido`);
});

document.getElementById("cfgOnlineMode").checked = server.onlineMode;
document.getElementById("cfgViewDistance").value = server.viewDistance;
document.getElementById("cfgSimDistance").value = server.simulationDistance;
document.getElementById("cfgMaxPlayers").value = server.maxPlayers;
document.getElementById("cfgDifficulty").value = server.difficulty;

document.getElementById("configForm").addEventListener("submit", (e) => {
  e.preventDefault();
  server = scUpdateServer(server.id, {
    onlineMode: document.getElementById("cfgOnlineMode").checked,
    viewDistance: Number(document.getElementById("cfgViewDistance").value),
    simulationDistance: Number(document.getElementById("cfgSimDistance").value),
    maxPlayers: Number(document.getElementById("cfgMaxPlayers").value),
    difficulty: document.getElementById("cfgDifficulty").value
  });
  scAppendConsole("[Servidor] server.properties actualizado.");
  scRenderHeader();
  scToast("Configuración guardada");
});

document.getElementById("deleteServerBtn").addEventListener("click", () => {
  if (!confirm(`¿Eliminar "${server.displayName}" de ServerColab?`)) return;
  const servers = scGetServers().filter(s => s.id !== server.id);
  scSaveServers(servers);
  window.location.href = "../panel.html";
});

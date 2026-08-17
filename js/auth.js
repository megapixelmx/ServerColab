const tabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
  });
});

function scStartSession(user) {
  scSetSession({
    username: user.username,
    email: user.email,
    authMethod: user.authMethod,
    driveConnected: user.authMethod === "google",
    avatarInitial: user.username.charAt(0).toUpperCase(),
    loggedAt: Date.now()
  });
  scSeedServersIfEmpty(user.email);
  window.location.href = "panel.html";
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errorEl = document.getElementById("loginError");
  errorEl.hidden = true;

  const users = scGetUsers();
  const user = users.find(u => (u.username === identifier || u.email === identifier) && u.password === pass);

  if (!user) {
    errorEl.textContent = "Usuario, correo o contraseña incorrectos.";
    errorEl.hidden = false;
    return;
  }
  scStartSession(user);
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value;
  const pass2 = document.getElementById("regPass2").value;
  const errorEl = document.getElementById("registerError");
  errorEl.hidden = true;

  if (username.length < 3) {
    errorEl.textContent = "El nombre de usuario debe tener al menos 3 caracteres.";
    errorEl.hidden = false;
    return;
  }
  if (pass.length < 6) {
    errorEl.textContent = "La contraseña debe tener al menos 6 caracteres.";
    errorEl.hidden = false;
    return;
  }
  if (pass !== pass2) {
    errorEl.textContent = "Las contraseñas no coinciden.";
    errorEl.hidden = false;
    return;
  }

  const users = scGetUsers();
  if (users.some(u => u.username === username)) {
    errorEl.textContent = "Ese nombre de usuario ya está en uso.";
    errorEl.hidden = false;
    return;
  }

  const newUser = {
    id: scUid("user"),
    username,
    email: `${username}@local.serverclab`,
    password: pass,
    authMethod: "local",
    createdAt: Date.now()
  };
  users.push(newUser);
  scSaveUsers(users);
  scStartSession(newUser);
});

let pendingGoogleFlow = null;
const permissionsModal = document.getElementById("permissionsModal");

function scOpenGoogleFlow(mode) {
  pendingGoogleFlow = mode;
  permissionsModal.hidden = false;
}

document.getElementById("googleLoginBtn").addEventListener("click", () => scOpenGoogleFlow("login"));
document.getElementById("googleRegisterBtn").addEventListener("click", () => scOpenGoogleFlow("register"));
document.getElementById("closePermissionsModal").addEventListener("click", () => permissionsModal.hidden = true);

document.getElementById("grantPermissionsBtn").addEventListener("click", () => {
  if (SERVERCOLAB_CONFIG.GOOGLE_CLIENT_ID.startsWith("[AQUI")) {
    scToast("Falta configurar GOOGLE_CLIENT_ID en js/config.js", "error");
  }

  const fakeEmail = `usuario.colab${Math.floor(Math.random() * 900 + 100)}@gmail.com`;
  const username = fakeEmail.split("@")[0];
  const users = scGetUsers();
  let user = users.find(u => u.email === fakeEmail);

  if (!user) {
    user = {
      id: scUid("user"),
      username,
      email: fakeEmail,
      password: null,
      authMethod: "google",
      createdAt: Date.now()
    };
    users.push(user);
    scSaveUsers(users);
  }

  permissionsModal.hidden = true;
  scStartSession(user);
});

(function scAutoRedirectIfLogged() {
  if (scGetSession()) {
    window.location.href = "panel.html";
  }
})();

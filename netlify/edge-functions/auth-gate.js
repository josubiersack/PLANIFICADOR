// netlify/edge-functions/auth-gate.js
// Protege TODO el sitio (HTML, assets y /.netlify/functions/*) con una
// contraseña compartida usando una cookie de sesión de 7 días.
// Requiere la variable de entorno APP_PASSWORD en Netlify.
// Si APP_PASSWORD no está definida, no bloquea nada (para no tumbar el sitio
// antes de configurarla).

const COOKIE_NAME = "planificador_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 días
const SESSION_MESSAGE = "planificador-docente-session-v1";

function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

// Token derivado de la contraseña (HMAC-SHA256). La contraseña real nunca
// viaja en la cookie; si cambia, las sesiones anteriores quedan inválidas.
async function sessionToken(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "HMAC", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_MESSAGE));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function esc(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rutaSegura(next) {
  const n = String(next || "/");
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

function formHtml(next, error) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Acceso restringido — Planificador Docente</title>
<style>
  body { font-family: Arial, sans-serif; background: #f7fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .caja { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; width: 320px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
  h1 { font-size: 1.05rem; color: #1a365d; margin: 0 0 0.5rem; }
  p { font-size: 0.85rem; color: #4a5568; margin: 0 0 1rem; }
  input[type=password] { width: 100%; box-sizing: border-box; padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; }
  button { width: 100%; margin-top: 0.75rem; padding: 0.6rem; background: #3182ce; color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
  .error { color: #c53030; font-size: 0.8rem; margin: 0.6rem 0 0; }
</style>
</head>
<body>
<form class="caja" method="POST" action="">
  <h1>🔒 Planificador Docente</h1>
  <p>Introduce la contraseña para acceder al sitio.</p>
  <input type="password" name="password" placeholder="Contraseña" autofocus required/>
  <input type="hidden" name="next" value="${esc(rutaSegura(next))}"/>
  <button type="submit">Entrar</button>
  ${error ? '<p class="error">Contraseña incorrecta. Intenta de nuevo.</p>' : ""}
</form>
</body>
</html>`;
}

export default async (request, context) => {
  const password = Deno.env.get("APP_PASSWORD") || "";
  if (!password) return context.next();

  const url = new URL(request.url);

  // Intento de login: POST de formulario (el fetch de la app usa JSON, no interfiere)
  if (request.method === "POST" && (request.headers.get("content-type") || "").includes("application/x-www-form-urlencoded")) {
    let datos;
    try { datos = await request.formData(); } catch { datos = null; }
    const intentada = datos ? datos.get("password") || "" : "";
    const destino = datos ? rutaSegura(datos.get("next")) : "/";
    if (intentada === password) {
      const token = await sessionToken(password);
      return new Response(null, {
        status: 302,
        headers: {
          location: destino,
          "set-cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`,
        },
      });
    }
    return new Response(formHtml(destino, true), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Navegación o petición de datos: exige cookie válida o muestra el formulario
  const token = getCookie(request, COOKIE_NAME);
  if (token && token === (await sessionToken(password))) return context.next();

  return new Response(formHtml(url.pathname + url.search, false), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

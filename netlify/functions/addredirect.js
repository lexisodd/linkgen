const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { nombre, enlace } = JSON.parse(event.body);

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "LXS_Portfolio";
  const USER = "lexisodd";
  const RUTA = `${nombre}.html`;

  const contenido = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=${enlace}" />
    <script>window.location.href = "${enlace}";</script>
  </head>
  <body>
    Si no fuiste redirigido automáticamente, <a href="${enlace}">hacé clic acá</a>.
  </body>
</html>`;

  const base64 = Buffer.from(contenido).toString("base64");

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${RUTA}`;

  let sha = null;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (err) {
    return { statusCode: 500, body: "Error comprobando archivo existente." };
  }

  const respuesta = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `add redirect for ${nombre}`,
      content: base64,
      sha: sha || undefined,
    }),
  });

  if (respuesta.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, nombre }),
    };
  } else {
    const error = await respuesta.json();
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

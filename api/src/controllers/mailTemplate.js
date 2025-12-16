module.exports = {
    mailTemplate: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Credenciales - Votaciones Electrónicas del CFIA</title>
  <style>
    /* Estilos mínimos compatibles con clientes de correo */
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color: #ffffff;
    }
    a { color: #d32f2f; text-decoration: none; }
    .container { width: 100%; max-width: 640px; margin: 0 auto; }
    .card { background-color: #111111; padding: 0; border-radius: 4px; overflow: hidden; }
    .header {
      background-color: #0f6b78;
      padding: 22px 20px;
      text-align: center;
      font-weight: 700;
      font-size: 20px;
      color: #ffffff;
    }
    .body {
      padding: 20px;
      color: #eaeaea;
      line-height: 1.4;
      font-size: 14px;
    }
    .muted { color: #cfcfcf; font-size: 13px; }
    .credentials {
      display: table;
      width: 100%;
      margin: 18px 0;
    }
    .cred-row { display: table-row; }
    .cred-cell {
      display: table-cell;
      vertical-align: top;
      padding: 8px 10px;
    }
    .cred-label { color: #bdbdbd; font-size: 13px; }
    .cred-value {
      margin-top: 6px;
      background-color: #0b0b0b;
      padding: 8px 10px;
      border-radius: 4px;
      border: 1px solid #222;
      color: #ffffff;
      font-weight: 600;
      word-break: break-all;
    }
    .cta {
      display: inline-block;
      margin-top: 14px;
      padding: 10px 16px;
      border-radius: 4px;
      background-color: transparent;
      border: 2px solid #d32f2f;
      color: #d32f2f;
      font-weight: 700;
    }
    .footer-bar {
      background-color: #d32f2f;
      color: #ffffff;
      padding: 12px 20px;
      font-size: 13px;
    }
    @media only screen and (max-width:480px){
      .header { font-size: 18px; padding: 16px; }
      .body { padding: 16px; }
    }
  </style>
</head>

<body>
  <table role="presentation" cellpadding="0" cellspacing="0" class="container">
    <tr>
      <td>
        <div class="card" style="border-radius:8px; overflow:hidden;">
          <!-- Header -->
          <div class="header">Votaciones Electrónicas del CFIA</div>

          <!-- Body -->
          <div class="body">
            <p style="margin:0 0 10px 0;">
              <strong>Estimado(a) {nombre}:</strong>
            </p>

            <p class="muted">
              Para ejercer su derecho al voto mediante el sistema electrónico habilitado para las votaciones del colegio,
              utilice las siguientes credenciales personales:
            </p>

            <p style="margin-top:12px;">
              <a class="cta" href="https://www.sicop.go.cr/" target="_blank" rel="noopener">
                Ingresar a la Votación
              </a>
            </p>

            <div class="credentials" role="table">
              <div class="cred-row" role="row">
                <div class="cred-cell" style="width:33%">
                  <div class="cred-label">Cédula</div>
                  <div class="cred-value">{cedula}</div>
                </div>
                <div class="cred-cell" style="width:33%">
                  <div class="cred-label">Carné</div>
                  <div class="cred-value">{carne}</div>
                </div>
                <div class="cred-cell" style="width:34%">
                  <div class="cred-label">Contraseña</div>
                  <div class="cred-value">{contrasena}</div>
                </div>
              </div>
            </div>

            <p class="muted">
              Si tiene algún problema para ingresar, responda este correo o contacte a soporte.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer-bar">CFIA</div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
};

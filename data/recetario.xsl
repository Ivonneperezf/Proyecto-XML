<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:r="http://www.recetas.com"
    exclude-result-prefixes="r">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Recetario</title>
        <!-- Bootswatch Minty -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/minty/bootstrap.min.css"/>
        <style>
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .card {
            border-radius: 20px;
            border: none;
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
          }
          h1 {
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container my-5">
          <h1 class="mb-4 text-center">Recetario de Cocina</h1>

          <xsl:for-each select="r:recetario/r:receta">
            <div class="card mb-4 shadow">
              <div class="card-body">
                <h2 class="card-title" style="color: #78C2AD; border-bottom: 3px solid #78C2AD; padding-bottom: 10px; display: inline-block;"><xsl:value-of select="r:nombre"/></h2>
                
                <div class="mb-3">
                  <span class="badge me-2" style="background: linear-gradient(135deg, #78C2AD 0%, #56ab91 100%); font-size: 0.95rem; padding: 0.5rem 1rem;">
                    📂 <xsl:value-of select="@categoria"/>
                  </span>
                  <span class="badge" style="background: linear-gradient(135deg, #F3969A 0%, #e7767b 100%); font-size: 0.95rem; padding: 0.5rem 1rem;">
                    📊 <xsl:value-of select="@dificultad"/>
                  </span>
                </div>

                <div class="alert" style="background-color: #E8F5F1; border-left: 4px solid #78C2AD; color: #2d6654;">
                  <strong>📝 Descripción:</strong> <xsl:value-of select="r:descripcion"/>
                </div>

                <!-- Ingredientes -->
                <h4 class="mt-4" style="color: #78C2AD;">🛒 Ingredientes</h4>
                <table class="table table-striped table-bordered">
                  <thead style="background: linear-gradient(135deg, #78C2AD 0%, #56ab91 100%); color: white;">
                    <tr>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Ingrediente</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="r:ingredientes/r:ingrediente">
                      <tr>
                        <td><strong><xsl:value-of select="@cantidad"/></strong></td>
                        <td><xsl:value-of select="@unidad"/></td>
                        <td><xsl:value-of select="."/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>

                <!-- Preparación -->
                <h4 class="mt-4" style="color: #F3969A;">👨‍🍳 Preparación</h4>
                <ol class="list-group list-group-numbered">
                  <xsl:for-each select="r:preparacion/r:paso">
                    <li class="list-group-item" style="border-left: 3px solid #F3969A;"><xsl:value-of select="."/></li>
                  </xsl:for-each>
                </ol>

                <!-- Datos extra -->
                <div class="alert mt-4" style="background: linear-gradient(135deg, #E8F5F1 0%, #d4ebe3 100%); border-left: 4px solid #78C2AD; color: #2d6654;">
                  <strong>⏱️ Tiempo total:</strong> <xsl:value-of select="r:tiempo/@total"/> <xsl:value-of select="r:tiempo/@unidad"/> | 
                  <strong>👥 Porciones:</strong> <xsl:value-of select="r:porciones/@cantidad"/>
                </div>

                <!-- Enlaces -->
                <p class="mb-2">
                  <strong>🎥 Video:</strong> 
                  <a href="{r:video/@url}" target="_blank" class="btn btn-sm ms-2" style="background: linear-gradient(135deg, #78C2AD 0%, #56ab91 100%); color: white; border: none;">Ver video</a>
                </p>
                <p class="mb-2">
                  <strong>🔗 Enlace:</strong> 
                  <a href="{r:enlace/@url}" target="_blank" class="btn btn-sm ms-2" style="background: linear-gradient(135deg, #78C2AD 0%, #56ab91 100%); color: white; border: none;">Ver receta original</a>
                </p>

                <!-- Notas -->
                <div class="alert mt-3" style="background: linear-gradient(135deg, #FFF4E0 0%, #ffe9c5 100%); border-left: 4px solid #FFD93D; color: #8b6914;">
                  <strong>💡 Nota:</strong> <xsl:value-of select="r:notas"/>
                </div>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
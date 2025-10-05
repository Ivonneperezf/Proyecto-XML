<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:r="http://www.recetas.com"
    exclude-result-prefixes="r">
  <xsl:template match="/">
    <html>
      <head>
        <title>Recetario</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background:#fafafa; 
            margin:20px;
          }
          h1 { 
            color: #295700; 
          }
          h2 { 
            color: #46c001; 
            margin-top: 30px; 
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom:20px; 
          }
          th, td { 
            border: 1px solid #ccc; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background: #50863f; 
            color: white; 
          }
          ul { 
            margin: 0; 
            padding-left: 20px; 
          }
          .nota { 
            font-style: italic; 
            color:#555; 
          }
          .video a, .enlace a { 
            color:#2980b9; 
            text-decoration:none; 
          }
        </style>
      </head>
      <body>
        <h1>Recetario de Cocina</h1>
        <xsl:for-each select="r:recetario/r:receta">
          <div class="receta">
            <h2><xsl:value-of select="r:nombre"/></h2>
            <p><b>Categoría:</b> <xsl:value-of select="@categoria"/> | <!-- atributo-->
               <b>Dificultad:</b> <xsl:value-of select="@dificultad"/></p>
            <p><b>Descripción:</b> <xsl:value-of select="r:descripcion"/></p>
            <!-- Ingredientes -->
            <h3>Ingredientes</h3>
            <table>
              <tr>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Ingrediente</th>
              </tr>
              <xsl:for-each select="r:ingredientes/r:ingrediente">
                <tr>
                  <td><xsl:value-of select="@cantidad"/></td>
                  <td><xsl:value-of select="@unidad"/></td>
                  <td><xsl:value-of select="."/></td> <!-- Este se coloca para los valores dentro de la etiqueta-->
                </tr>
              </xsl:for-each>
            </table>
            <!-- Preparación -->
            <h3>Preparación</h3>
            <ol>
              <xsl:for-each select="r:preparacion/r:paso">
                <li><xsl:value-of select="."/></li>
              </xsl:for-each>
            </ol>
            <!-- Datos extra -->
            <p><b>Tiempo total:</b> <xsl:value-of select="r:tiempo/@total"/> <xsl:value-of select="r:tiempo/@unidad"/> | 
               <b>Porciones:</b> <xsl:value-of select="r:porciones/@cantidad"/></p>
            <!-- Enlaces -->
            <p class="video"><b>Video:</b> 
              <a href="{r:video/@url}" target="_blank"><xsl:value-of select="r:video/@url"/></a></p>
            <p class="enlace"><b>Enlace:</b> 
              <a href="{r:enlace/@url}" target="_blank"><xsl:value-of select="r:enlace/@url"/></a></p>
            <!-- Notas -->
            <p class="nota">Nota: <xsl:value-of select="r:notas"/></p>
            <hr/>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

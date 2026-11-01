# Gabriel Marmanillo · Porfolio

Porfolio en español de Walter Gabriel Marmanillo, desarrollado con HTML, CSS y JavaScript, sin frameworks ni proceso de compilación.

**Sitio:** https://gabrielunsa.github.io/

## Contenido

- Portada profesional con especialidad y tecnologías principales.
- Lectura orientada a reclutadores: proyectos seleccionados, experiencia y perfil técnico antes del archivo completo.
- Experiencia como desarrollador, profesor de Informática y técnico, con responsabilidades, períodos y proyectos relacionados.
- Tres sistemas destacados: Seguimiento Estudiantil, Servicio de Orientación y SANeCIEM.
- Catálogo de 62 proyectos y grupos de prácticas en siete categorías, con descripciones, tecnologías, búsqueda sin distinción de tildes, filtros y ordenamiento.
- Fichas de descripción con enlaces al código público o indicación de código privado.
- Los 10 repositorios públicos de GabrielUnsa, más dos repositorios locales presentados mediante descripciones.
- Explorador de archivos de código y ejercicios públicos, con búsqueda, filtro por repositorio y acceso directo a GitHub.
- Acceso a los juegos existentes en `intertribus/` y `pasapalabras/`.
- Diseño adaptable, navegación por teclado, enlaces para saltar al contenido y soporte de movimiento reducido.
- Cabecera fija, navegación activa, menú móvil, progreso de lectura y acceso para volver al inicio.
- Animaciones de entrada al hacer scroll, inclinación 3D e iluminación perimetral reactiva en tarjetas, microinteracciones magnéticas y transiciones de vista. El contenido se mantiene visible si no hay soporte de animación.
- Archivos completos de proyectos, formación, investigación y repositorios desplegables; los enlaces directos abren el catálogo correspondiente.
- Interfaz moderna con fondo blanco cálido y tipografía en esquema de colores complementarios divididos.
- Apartado de IA aplicada al desarrollo con Codex, Claude y Antigravity y un flujo de contexto, propuesta, revisión y verificación.
- Formación continua: 48 cursos realizados, cinco actividades de actualización y un curso en progreso, con búsqueda por nombre o institución y filtros por año y estado.
- Investigación: siete trabajos de desarrollo y experimentación, y dos publicaciones con enlaces a SEDICI (UNLP) y al libro de resúmenes de las XV JEMU (UNSa).

Las descripciones se basan en la documentación de los proyectos. Se distinguen sistemas, prototipos, material histórico y ejercicios de aprendizaje. Las ilustraciones de los sistemas destacados son esquemas conceptuales, no capturas de sus interfaces.

La experiencia profesional se edita en la sección `#experiencia` de `index.html`. Los períodos proceden del registro curricular y se presentan dentro de las fichas de cada área. La experiencia en desarrollo se presenta mediante proyectos, sin atribuirle una antigüedad laboral no documentada. Se quitó el bloque separado de recorrido institucional.

## Estructura

```text
index.html                   Portada y secciones
assets/styles.css            Punto de entrada CSS (@import de módulos)
assets/css/tokens.css        Variables de diseño, tipografía, base, botones y etiquetas
assets/css/layout.css        Lienzo espacial, cabecera, navegación, progreso y pie
assets/css/sections.css      Portada, proyectos destacados, experiencia, perfil e IA
assets/css/catalog.css       Archivos desplegables, catálogos, formación, repositorios y diálogos
assets/css/animations.css    Inclinación 3D, revelados al scroll, media queries e impresión
assets/app.js                Punto de entrada JS e inicialización general
assets/js/utils.js           Funciones compartidas, categorías y plantilla de tarjetas
assets/js/dialog.js          Controlador del modal de detalle de proyectos
assets/js/projects.js        Búsqueda, filtrado, ordenamiento y atajos del catálogo
assets/js/repositories.js    Explorador de repositorios, pestañas e índice de archivos
assets/js/learning.js        Formación continua, prácticas e investigación
assets/motion.js             Entradas al scroll, inclinación 3D, navegación activa y apertura por enlaces
assets/projects.json         Descripciones curadas de proyectos y prácticas
assets/learning.json         Cursos, actividades, publicaciones y referencias a investigaciones
assets/repositories.json     Descripciones y metadatos de repositorios
assets/source-index.json     Índice de archivos públicos
assets/catalog.js            Datos estáticos generados para el navegador
assets/favicon.svg           Identidad gráfica
assets/social.svg / .png     Imagen para compartir
scripts/update-catalog.py    Actualización del catálogo
intertribus/                  Juego existente
pasapalabras/                Juego existente y podio
```

## Desarrollo local

Se necesita Python 3 para servir el sitio:

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. El porfolio no necesita backend, credenciales ni llamadas a la API durante la navegación. Las fuentes tipográficas se cargan desde Google Fonts con alternativas del sistema.

## Actualizar proyectos

Editar `assets/projects.json` y regenerar `assets/catalog.js` con uno de los comandos de la siguiente sección. Cada objeto contiene:

```json
{
  "id": "identificador-unico",
  "title": "Nombre del proyecto",
  "category": "web",
  "description": "Descripción breve y comprobable.",
  "tags": ["React", "TypeScript"],
  "status": "Proyecto",
  "repo": "Web",
  "source": "https://github.com/GabrielUnsa/Web"
}
```

Categorías: `sistemas`, `web`, `ia`, `investigacion`, `scripts`, `ejercicios` y `juegos`. Se pueden añadir `detail` para ampliar la descripción, `featured` para priorizar la entrada y `demo` para una página ejecutable. Los proyectos privados usan `private: true` y omiten `repo`, `source` y `demo` si no hay acceso público. La descripción general del repositorio se edita en `assets/repositories.json`.

## Actualizar formación e investigación

Editar `assets/learning.json`. `courses` contiene títulos, instituciones, fechas y estados: `completed` (curso realizado), `participation` (actividad de actualización) o `in-progress` (en curso). La fecha puede ser `AAAA-MM` o `AAAA` cuando el registro solo indica el año. `material` es un enlace opcional a prácticas relacionadas; no representa un certificado.

`publications` conserva las referencias y los enlaces institucionales. `researchProjectIds` y `studyProjectIds` reutilizan las fichas de `assets/projects.json`, de modo que cada descripción se mantiene en un solo lugar. Las publicaciones se presentan como artículo de congreso o comunicación educativa; los proyectos y experimentos se muestran por separado.

Para regenerar el sitio después de un cambio editorial, sin consultar de nuevo los repositorios:

```bash
python3 scripts/update-catalog.py --cached
```

Ese modo conserva el último índice verificado de los demás repositorios públicos y actualiza los archivos del propio porfolio desde el checkout. Para consultar cambios externos o incorporar nuevos repositorios públicos, usar `--github`.

## Actualizar el índice público

Desde la raíz del repositorio, con acceso a Internet:

```bash
python3 scripts/update-catalog.py --github
```

La herramienta pagina los repositorios públicos y consulta sus árboles de archivos. No requiere token, no consulta repositorios privados ni descarga contenidos de archivos. Conserva las descripciones curadas; los repositorios públicos nuevos se incorporan con su descripción de GitHub. El porfolio se indexa desde el checkout local para que sus enlaces correspondan al estado que se va a publicar.

Como alternativa sin red, cuando todos los repositorios públicos están clonados en el directorio superior:

```bash
python3 scripts/update-catalog.py --local-root ..
```

Ese modo indexa los archivos versionados en las copias locales, que podrían contener cambios aún no publicados. Para verificar los enlaces públicos se recomienda `--github`.

Se excluyen dependencias, entornos virtuales, datasets, archivos de entorno, padrones, respaldos y algunos recursos de terceros. Los repositorios privados aportan solamente las descripciones seleccionadas en este porfolio; no se copian sus archivos. El catálogo es una instantánea: no cambia automáticamente al crear otro repositorio.

## Publicación en GitHub Pages

El sitio se sirve directamente desde la raíz de `main`, con `.nojekyll`. No requiere instalación de dependencias. Después de actualizar los datos, subir los cambios a la rama configurada para Pages. Los juegos mantienen sus rutas originales.

## Verificación

Comprobación de sintaxis:

```bash
node --check assets/js/utils.js
node --check assets/js/dialog.js
node --check assets/js/projects.js
node --check assets/js/repositories.js
node --check assets/js/learning.js
node --check assets/app.js
node --check assets/motion.js
node --check assets/catalog.js
python3 -m py_compile scripts/update-catalog.py
```

Las interacciones del catálogo se verificaron en un DOM simulado: búsquedas con y sin tildes, filtros, ordenamiento, paginación, fichas públicas y privadas, pestañas y enlaces de juegos. La revisión visual en navegador requiere un entorno con vista previa disponible.

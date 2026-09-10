# GabrielUnsa.github.io

Portfolio personal de **Walter Gabriel Marmanillo** — Analista de Sistemas, desarrollador
full-stack y docente de informática (Salta, Argentina).

🔗 **https://gabrielunsa.github.io**

## Sobre el sitio

Una sola página, sin frameworks ni proceso de build: HTML, CSS y JavaScript puro.
Se sirve directamente desde GitHub Pages.

### Características

- Fondo animado con gradientes en movimiento y luz que sigue al cursor
- Animaciones de entrada al hacer scroll (`IntersectionObserver`)
- Efecto máquina de escribir en los roles del encabezado
- Grilla de proyectos filtrable por categoría con transiciones
- Sección de perfil técnico con fortalezas, áreas a fortalecer y nivel estimado por área
- Contadores animados, barra de progreso de lectura y navegación con sección activa
- Tema claro / oscuro persistente (respeta la preferencia del sistema)
- Diseño responsive y soporte de `prefers-reduced-motion`

## Estructura

```
index.html            Portfolio completo (estilos y scripts incluidos)
clase-de-apoyo.html   Página anterior del repositorio, conservada
README.md
```

## Agregar un proyecto

Los proyectos viven en el array `PROJECTS`, dentro del `<script>` al final de `index.html`.
Copiá un objeto existente y editalo:

```js
{ t:"Nombre del proyecto", ico:"🚀", cat:"web", year:"2026",
  star:true,          // opcional: lo marca como destacado
  repo:"NombreRepo",  // enlaza a github.com/GabrielUnsa/NombreRepo
  priv:true,          // o marcalo como privado (sin enlace)
  d:"Descripción del proyecto.",
  tags:["React","Node.js"] }
```

Categorías disponibles: `web`, `ia`, `sistemas`, `fundamentos`.
Los contadores de cada filtro se calculan solos.

## Ajustar el perfil técnico

La evaluación por área vive en el array `LEVELS`, junto a `PROJECTS`:

```js
{ tier:3, area:"Backend y APIs", v:2.9, tag:"Semi-Senior",
  ev:"Texto que aparece al pasar el cursor sobre la barra." }
```

`v` es el valor en la escala 1–4 (Trainee, Junior, Semi-Senior, Senior) y define
el largo de la barra. `tier` (1–4) elige el escalón de color y se declara aparte
para que el color y la etiqueta nunca se contradigan.

Los colores salen de una rampa ordinal de un solo tono, validada para que los
pasos sean monótonos y el extremo más cercano al fondo supere 2:1 de contraste
en ambos temas. Si cambiás los tonos, mantené esa propiedad.

## Desarrollo local

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Licencia

MIT

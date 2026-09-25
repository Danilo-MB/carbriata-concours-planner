# 🏎️ Carbriata Concours — Master Event Planner & 3D Interactive Map

Aplicación web diseñada especialmente para la organización y exhibición de eventos de autos clásicos y deportivos en movimiento, inspirada y brandeada para el **Carbriata Concours** ([@carbriata en Instagram](https://www.instagram.com/carbriata/)), fundado por **Lucas Abriata**.

La aplicación permite al organizador seleccionar una locación (autódromo, club de polo, estancia o parque privado), cambiar de sede año a año, delimitar parcelas y stands donde naturalmente no hay divisiones físicas, trazar rectas de aceleración y rutas de desfile, y asignar a cada stand o vehículo una **galería de fotos de alta resolución** (alternativa visual directa a Google Street View en predios cerrados).

---

## 🌟 Características Principales

### 1. 🗺️ Motor Cartográfico 2D y 3D de Alta Definición
* **Fotografía Satelital HD**: Vista aérea nítida provista por *Esri World Imagery*, que permite apreciar el césped, las banquinas, las pistas y las construcciones con gran nivel de detalle.
* **Modo 2D (Plano Cenital)**: Vista top-down ortogonal (inclinación $0^\circ$), ideal para agrimensura visual, delimitación precisa de lotes y trazado de caminos.
* **Modo 3D (Perspectiva & Volumen Real)**: Inclinación dinámica de cámara ($60^\circ$) con **extrusión tridimensional (`fill-extrusion`)** en metros reales para simular carpas VIP, gazebos, stands de marcas y boxes de preparación con sombreado volumétrico.
* **Vuelo Panorámico Drone 360° (Orbit Mode)**: Animación cinemática continua de la cámara sobrevolando el circuito para presentaciones a sponsors y prensa.
* **Selector de Capas**: Satélite HD, Satélite Híbrido, Dark Concours (modo nocturno) y Callejero Catastral.

### 2. 📍 Multi-Locación & Flexibilidad Año a Año
* **Edición Inaugural Dolores 2026 (7 de Marzo)**:
  * Ubicación real: **Autódromo Municipal Miguel Ángel Atauri**, Dolores (Autovía 2 km 210).
  * Viene pre-cargado con el plano oficial: Recta principal de aceleración dinámica, Paddock & Boxes, Lawn de Exhibición de Clásicos, Carpa VIP Club Lucas Abriata, Boulevard Gastronómico, Helipuerto y Pista de aterrizaje para aeronaves privadas.
* **Locaciones Adicionales Pre-configuradas**:
  * *Hipódromo de San Isidro / Campo Argentino de Polo* (Edición césped d'élégance).
  * *Estancia Histórica Villa María* (Edición parque botánico y palacio).
  * *Autódromo Juan Manuel Fangio, Balcarce* (Edición circuito entre sierras).
* **Definición de Nuevos Predios**:
  * Botón para fijar cualquier coordenada del mundo como una nueva sede o edición de un año futuro.

### 3. ✏️ Herramientas de Dibujo y Delimitación en el Mapa
* **Delimitar Área (Polígonos 2D / 3D)**:
  * Permite trazar los límites de stands comerciales, boxes, paddocks, parcelas en césped o estacionamientos donde no existen límites físicos.
  * Cálculo en tiempo real de **superficie en metros cuadrados ($m^2$) y hectáreas**, y perímetro.
  * Personalización de color, opacidad y **altura arquitectónica 3D (0 a 15 metros)**.
* **Trazar Ruta (Pista & Caminos)**:
  * Dibuja rectas de aceleración, trazados de desfile o accesos de vehículos clásicos con cálculo de longitud en metros.
* **Añadir Auto / Stand (Marcadores Interactivos)**:
  * Coloca pines con miniatura fotográfica del vehículo o atracción.
  * Incluye ficha técnica: Modelo, Versión, Año, Potencia (CV), Motor, Propietario, Badge de distinción y Reseña histórica.

### 4. 📸 Sistema de Fotos & Galería ("Street View" para Predios Privados)
* Al no existir Google Street View dentro de autódromos, pistas o estancias de campo, la app incorpora un **gestor multimedia**:
  * **Carga de fotos locales** (arrastrar y soltar o selector de archivos locales mediante base64).
  * **Incorporación de URLs** de fotos en internet (Instagram, prensa, etc.).
  * **Spotlight Lightbox**: Visualizador en pantalla completa con carrusel de fotos, especificaciones mecánicas y enlace a la posición en el mapa.
  * **Sonido de Aceleración (Web Audio API)**: Botón para escuchar el bramido sintético de aceleración (el icónico turbo 5 cilindros del Audi Quattro S1, V8 italiano estilo Ferrari F40, V8 Big Block estilo Shelby Cobra o Flat-6 clásico).

### 5. 👥 Modo Organizador vs. Modo Visitante
* **Modo Organizador (Planner)**: Barra de herramientas de dibujo activa, botones de edición y borrado de zonas, subida de fotos y controles de exportación.
* **Modo Visitante (Showroom)**: Interfaz limpia y despejada para que los espectadores o patrocinadores exploren el evento en 3D, filtren autos por categoría y accedan a las fichas fotográficas.

### 6. 💾 Guardado, Exportación e Importación
* Persistencia automática en el navegador (`localStorage`).
* **Descarga en formato JSON**: Guarda la configuración completa de zonas, fotos y autos para archivar ediciones anuales.
* **Exportación GeoJSON estándar**: Compatible con Google Earth, Mapbox, QGIS y ArcGIS.
* **Importación directa**: Carga cualquier archivo JSON previo para alternar rápidamente entre proyectos.

---

## 🚀 Cómo Ejecutar la Aplicación

La aplicación web está construida con tecnologías web estándar modernas (HTML5, CSS3, ES Modules, MapLibre GL JS v4, FontAwesome 6) **sin requerir pasos complejos de compilación**.

### Opción 1: Servidor Local (Recomendado)
Desde la carpeta del proyecto, ejecuta:
```bash
python3 -m http.server 8080
```
Luego abre en tu navegador preferido:
👉 **[http://localhost:8080](http://localhost:8080)**

### Opción 2: Abrir directamente el archivo
Puedes hacer doble clic en `index.html` para abrirlo en cualquier navegador (Chrome, Safari, Firefox o Edge).

---

## 📁 Directorio del Proyecto
Ubicación en tu sistema:
`/Users/danilo/.gemini/antigravity/scratch/carbriata-concours-planner`

> **Recomendación**: Configura este directorio como tu espacio de trabajo activo en tu entorno de desarrollo para continuar iterando o agregando funciones.

# estilo.md — guía de edición (sacada de `referencia.mp4`)

Fuente del análisis: `referencia.mp4`, 90,3 s, 576x1024, 30 fps, AAC mono 44,1 kHz. Se extrajeron 181 fotogramas (2/s), 5 a 20 cambios de plano según umbral, y el audio.
Todas las medidas de px están en el original (576 px de ancho). Entre paréntesis, el valor ×1,875 para nuestro lienzo de 1080x1920.
Lo que no se pudo medir con precisión va marcado como **[SUPOSICIÓN]**.

Formato de salida: vertical 1080x1920, 30 fps.

## 1. Ritmo y cortes
- Plano fijo de una sola persona sentada, cámara estática. La edición se hace con textos y zooms, no con cambios de cámara.
- Cambios de plano detectados (umbral 0,08): 19 en 85 s. El tiempo medio entre cambios es 4,5 s (rango 1,0 a 12,0 s).
- Instantes de los cambios: 3,6 / 10,0 / 15,6 / 22,3 / 25,9 / 29,0 / 35,1 / 40,5 / 41,6 / 43,4 / 44,5 / 46,3 / 52,6 / 64,8 / 73,1 / 79,7 / 85,3 s.
- Con umbral 0,25 solo salen 5 cortes (41,6 / 43,4 / 44,5 / 46,3 / 86,3 s). Los demás son saltos suaves o cambios de encuadre (zoom).
- Silencios: no hay ninguna pausa ≥0,3 s por debajo de -42 dB en los primeros 84 s. Solo el 2,3 % de las ventanas de 100 ms baja de -50 dB. El habla ya viene sin silencios muertos.
- Regla para nuestro video: cortar toda pausa >0,3 s y dejar un colchón de 0,05 s antes y 0,08 s después de cada palabra **[SUPOSICIÓN]**.
- Los últimos 5 s son la pantalla de cierre de TikTok (fondo negro). **No se copia.**

## 2. Subtítulos (texto base, siempre presente mientras habla)
- Fuente: serif de alto contraste, tipo Didone estrecha (Playfair Display / Bodoni Moda) **[SUPOSICIÓN]**. Peso regular, color negro `#000`, sin borde ni sombra.
- Tamaño: unos 24 px de cuerpo (≈45 px en 1080).
- Posición: centrado en horizontal. Primera línea con el centro en y ≈ 315 de 1024 (31 % desde arriba, ≈ y 590 en 1920). Va por encima de la cabecera de la cama, no encima de la cara.
- Bloque: 1 o 2 líneas, de 3 a 9 palabras (media ≈ 6) y máximo ≈ 40 caracteres por línea. Ancho útil ≈ 55 % del cuadro.
- Duración del bloque: de 1,5 a 3,0 s (media ≈ 2,3 s). Cambia entero, no palabra a palabra.
- Animación de entrada: aparece de golpe, sin movimiento visible **[SUPOSICIÓN]**.
- No hay palabra destacada dentro del bloque pequeño. El énfasis va aparte (sección 3).

## 3. Palabras destacadas (texto grande, 1 a 3 palabras)
- Frecuencia: unas 24 apariciones en 84 s, es decir, una cada 3,5 s. Suelen sustituir al subtítulo pequeño mientras dura.
- Posición: centro en y ≈ 300 de 1024 (29 %, ≈ y 560 en 1920). Segunda línea más pequeña en y ≈ 360 (35 %, ≈ y 675).
- Ancho: hasta el 74 % del cuadro ("correcto" ocupa 425 de 576 px). Cuerpo ≈ 90 px (≈170 px en 1080).
- Fuentes por palabra (se cambia según el tono de la palabra):
  - Sans geométrica redonda en negrita (tipo Poppins / Montserrat ExtraBold): "mood", "correcto", "requiere", "ojo", "separación", "ego".
  - Sans en cursiva negra pesada: "bonito", "no.", "bye".
  - Manuscrita informal: "energía de paz", "ene…".
  - Mayúsculas rosa: "EN TU VIDA.", "CAMBIAR.".
  - Máquina de escribir con cursor: "TODO BIEN".
  - Cursiva estilizada crema: "todo bien", "haven".
- Colores: crema `#FFF8C8` con brillo suave (el más usado), blanco `#FFFFFF`, negro `#000`, rosa `#F6C9D3` / `#F8B8C8`.
- Animación: mecanografiado letra a letra ("evangelio", "amamos a Dios con locura") o aparición con fundido de 0,1 a 0,2 s. Salen con fundido de 0,1 s.
- Segunda línea: "tú y yo" bajo "mientras", "feliz" bajo "correcto", "igual." bajo "exactamente", "voluntad de Dios" bajo "separación".
- Los textos grandes sin fondo son de 1 a 3 palabras. Los que llevan cinta rosa o pastilla ("mantequilla", "armonía") son etiquetas con fondo `#F9C6D4` y bordes redondeados **[SUPOSICIÓN]**.

## 4. Textos y gráficos en pantalla (pegatinas)
- Pastilla rosa con texto blanco bajo la palabra clave ("mantequilla", "armonía").
- Óvalo rosa dibujado a mano alrededor de una frase o palabra ("hace poco vi que alguien dijo…", "pecado").
- Pegatinas pequeñas junto al texto: tostada con mantequilla, estrella azul y rosa, Biblia rosa con cruz dorada, signos "?" blancos (4 a la vez, animados).
- Tarjeta blanca con el versículo (≈ 3 s) y cita con fondo rosa sobre el texto grande ("ego").
- Pegatina "REMINDER: JESUS LOVES YOU!" en la esquina inferior derecha, con estrella rosa, solo en el final.
- Tamaño de pegatinas: de 45 a 70 px de alto (≈85 a 130 px en 1080).

## 5. B-roll y capturas
- Un solo bloque de b-roll en 85 s: capturas de la app "Haven" (≈ 41,6 a 52 s).
  - Logotipo y texto "haven" arriba, captura de pantalla de la app abajo.
  - Se superpone con 50 a 60 % de opacidad sobre el plano de ella, no a pantalla completa.
  - Pantallas mostradas: inicio con versículo del día, chat "Pregúntame lo que sea", teclado.
- Duración de cada captura: de 1,2 a 3,0 s.

## 6. Transiciones
- Casi no hay transiciones: corte seco entre planos.
- Entre el plano y las capturas hay fundido cruzado de unos 0,2 s (6 fotogramas) **[SUPOSICIÓN]**.
- No se ven barridos, glitches ni whooshes visuales.

## 7. Zooms
- Dos encuadres alternos del mismo plano: ancho (persona ≈ 38 % de la altura) y primer plano (cara ≈ 2× más grande, ≈ 200 %).
- Ejemplo: primer plano de 22,3 a 25,9 s (3,6 s), luego vuelta al plano ancho.
- Los saltos son secos (digital punch-in, sin interpolación) **[SUPOSICIÓN]**.
- Frecuencia: 1 primer plano cada 15 a 20 s, usado para frases de más peso.
- Dentro de un plano no hay zoom lento continuo.

## 8. Color
- Paleta cálida y pastel, bajo contraste: fondo beige `#D9C8BC` a `#BFAFA4`, ropa blanca, almohadas rosa `#E8B8B0`.
- Sin viñeta ni grano apreciables.
- Marca de agua de TikTok abajo a la derecha (viene grabada en el video). **No se copia.**

## 9. Sonido
- Solo voz. No se oye música de fondo **[SUPOSICIÓN]**: el nivel es estable, la mediana de las ventanas de 100 ms es -27 dB y el percentil 90 es -22 dB.
- Sonoridad integrada -24,9 LUFS, rango dinámico 3,0 LU.
- Hay un único transitorio fuerte en 73,3 s (≈ -18 dB). Podría ser un efecto de sonido **[SUPOSICIÓN]**.
- Sin efectos de sonido repetidos asociados a los textos.
- Objetivo para nuestro video: voz a ≈ -16 LUFS (mejor para móvil), sin música salvo que la pidas **[SUPOSICIÓN]**.

## 10. Correcciones aprendidas
_(aquí se añade cada cosa que me corrijas y te guste)_

### Corrección 1 — subtítulos (tras ver `referencia1.mp4` y `referencia2.mp4`)
- **Los subtítulos NO van en negro.** Van en blanco `#FFFFFF`, con sombra suave (`0 2px 10px rgba(0,0,0,.55)`) para que se lean sobre fondo claro.
- Fuente: serif Playfair Display 500, 52 px en 1080, 1 o 2 líneas, ancho 740 px.
- Posición: centro del cuadro, a unos 1080 px de 1920 (56 %), como en `referencia2.mp4`. Los destacados grandes siguen arriba.
- La palabra que se está diciendo se pinta en amarillo suave `#FFE680` (sincronizado palabra a palabra).
- Texto grande de las referencias: blanco o crema `#FFF8C8`, sans muy gruesa o serif en cursiva, tamaños muy distintos entre palabras (hasta ocupar todo el ancho).

### Corrección 2 — sonido (faltaban sonidos que cautiven)
- Análisis de las referencias: voz casi sola; `referencia1` (-13 LUFS) añade un colchón de ruido/música de ≈ 7 s en la intro con cortes rápidos; `referencia2` (-25,7 LUFS) mete un golpe de banda ancha en cada flash blanco y negro (≈ 9,8 s) y chasquidos finos. [SUPOSICIÓN: no se pudo aislar cada efecto de la voz.]
- Regla actual: whoosh/whip (alternando, volumen 0,55) en cada corte, empezando 3 fotogramas antes; "click" (0,7) al entrar cada palabra destacada, obturador en la primera; "ding" (0,35) en las palabras de brillo (súper, brillitos, postrecitos).
- Efectos tomados de remotion.media (`public/sfx/`). Sin música de fondo hasta que la pidas.

### Corrección 3 — efectos de las referencias, aprobados por ti
- **Flash blanco y negro al cambiar de idea:** en cada corte donde la pausa original duró ≥ 1,0 s. 7 fotogramas en escala de grises con contraste 1,35 y un destello blanco (0,95 → 0 en 4 fotogramas). Suena un obturador además del whoosh.
- **Pegatinas: NO.** No gustaron, se quitaron. No volver a ponerlas salvo que las pidas.
- **Palabras gigantes con glitch:** 3 por video (birthday cake, súper glowy, delicioso.). Montserrat Black en mayúsculas, hasta 240 px, centradas en el pecho (≈ y 1020). Dos copias rojo `#ff2e63` y cian `#00e5ff` en modo screen, desplazadas ±10 a 36 px los primeros 10 fotogramas y ±3 a 6 px después, con parpadeo cada 11 fotogramas y un corte horizontal desplazado. Suena un "switch" al entrar.
- **Contorno blanco recortado:** borde blanco de 15 px alrededor de la persona (MediaPipe), fondo apagado al 82 % y 25 % desaturado, sombra suave. **Solo en momentos importantes, no en todo el video** (todo el video quedó peor): desde 0,1 s antes hasta 0,35 s después de las palabras birthday cake, súper glowy, delicioso. y me encantó. Se genera con `scripts/cutout.py` y se monta sobre el video normal.

### Corrección 4 — lo que gustó y lo que no (tras el borrador 3)
- El borrador 2 (sin contorno permanente ni pegatinas) se veía mejor que el 3.
- Pegatinas: fuera. Contorno blanco: solo en los momentos clave (ver Corrección 3).
- Se mantienen: subtítulos blancos con palabra activa en amarillo, flash B/N en cambios de idea, palabras gigantes con glitch, efectos de sonido.

### Corrección 5 — vídeo con voz + material superpuesto (parches, `IMG_3959` + `video.mov` + `IMG_3955`)
- Duración: lo más corto posible, máximo 1 minuto (salió 35,8 s de 107 s). Se quitan silencios >0,3 s y se descartan las repeticiones, dejando la última toma buena de cada frase.
- **Sin flashes blancos** en este vídeo.
- Vídeo superpuesto: tarjeta con esquinas de 44 px y borde blanco de 8 px en la mitad inferior (880x680 px, y ≈ 1180), sin sonido propio; la cara y la voz siguen visibles y audibles. Aparece con spring de 12 fotogramas y suena `page-turn`. Subtítulos suben a y ≈ 1035 mientras hay tarjeta (1180 si no).
- Las grabaciones con cámara frontal vienen en espejo: se voltean horizontalmente para que el texto de productos y camiseta se lea bien.
- La voz suele venir baja (-36 dB de media): se normaliza a ≈ -16 LUFS con compresión suave en el vídeo final.
- Proxies de trabajo con `ffmpeg -g 30` (un fotograma clave por segundo) para que Remotion busque bien; los 4K originales no se usan directamente.
- **Calidad (corrección tras ver pixelación):** nunca recomprimir el vídeo dos veces. Los clips de trabajo se hacen desde el original con `scale=...:flags=lanczos` y `-crf 12`; Remotion renderiza con `--crf=14`; el audio se normaliza con `-c:v copy`. Para enviar por el chat (límite 30 MB) se hace una copia aparte a ≈ 6,4 Mbps; el archivo bueno es `out/parches_calidad_maxima.mp4`.
- Sonido en transiciones: sin whoosh/whip en los cortes; solo un `page-turn` suave (0,25) en la tarjeta y el "click" de los destacados. Se quitó "en este vienen".

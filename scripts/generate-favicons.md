# Favicon Generálás Útmutató

## Automatikus módszer (ajánlott)

### 1. Real Favicon Generator használata
1. Látogass el: https://realfavicongenerator.net/
2. Kattints a "Select your Favicon image" gombra
3. Töltsd fel a dark mode vagy light mode logót (PNG formátumban)
4. Állítsd be az opciókat:

#### iOS Web Clip
- Master picture: használd az eredeti képet
- Background color: White (#FFFFFF)
- Margin: 10-15%

#### Android Chrome
- Theme color: #FF00A1 (pink)
- Master picture: eredeti
- Margin: 10%

#### Windows Metro
- Tile color: #FF00A1

#### macOS Safari
- Theme color: #FF00A1
- Pinned tab icon: monokróm verzió (automatikusan generálja)

5. "Generate your Favicons and HTML code" gombra kattintás
6. Töltsd le a favicon package-et
7. Csomagold ki és másold a `.png` és `.ico` fájlokat a `public` mappába

## Manuális módszer (ImageMagick használatával)

Ha van ImageMagick telepítve, használd ezeket a parancsokat:

```bash
# Fő logo átméretezése különböző méretekre
convert logo-dark.png -resize 16x16 public/favicon-16x16.png
convert logo-dark.png -resize 32x32 public/favicon-32x32.png
convert logo-dark.png -resize 180x180 public/apple-touch-icon.png
convert logo-dark.png -resize 192x192 public/android-chrome-192x192.png
convert logo-dark.png -resize 512x512 public/android-chrome-512x512.png

# ICO file generálása (több méret kombinálva)
convert logo-dark.png -resize 16x16 -define icon:auto-resize=16,32,48 public/favicon.ico
```

## Online alternatívák

- **Favicon.io**: https://favicon.io/
  - Egyszerűbb interfész
  - Gyors generálás
  
- **Favicon Generator**: https://www.favicon-generator.org/
  - Több formátum támogatás

## Ellenőrzés

Miután elkészültek a favicon-ok, ellenőrizd:

1. **Fájl méretek:**
   - favicon-16x16.png: ~500 bytes
   - favicon-32x32.png: ~1-2 KB
   - apple-touch-icon.png: 180x180, ~5-10 KB
   - android-chrome-192x192.png: ~8-15 KB
   - android-chrome-512x512.png: ~20-40 KB

2. **Böngésző tesztelés:**
   - Nyisd meg az alkalmazást böngészőben
   - Nézd meg a tab-ot (látszik-e a favicon)
   - Mobil Safari: Add to Home Screen - nézd meg az ikont
   - Chrome (Android): Add to Home Screen

3. **Developer tools:**
   - Nyisd meg a Developer Console-t
   - Network tab → ellenőrizd, hogy betöltődnek-e a favicon fájlok
   - Ne legyen 404 error

## Troubleshooting

### Favicon nem jelenik meg
1. Hard refresh: Cmd+Shift+R (Mac) vagy Ctrl+Shift+R (Windows)
2. Törölj cache-t
3. Inkognito módban próbáld
4. Ellenőrizd a fájl elérési útvonalat a Network tab-ban

### Rossz méret/minőség
1. Használj PNG-t ICO helyett ahol lehet
2. Győződj meg róla, hogy az eredeti kép elég nagy (minimum 512x512)
3. Használj éles, vektoros logót ha lehetséges

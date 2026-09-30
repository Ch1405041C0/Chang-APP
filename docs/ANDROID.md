# Ejecutar Chang@ en Android

Requisitos:
- Node.js compatible con el SDK de Expo usado por el proyecto.
- Android Studio y Android SDK.
- Teléfono Android con depuración USB o emulador.

## Primera vez

```bash
npm install
npx expo prebuild -p android
npx expo run:android --device
```

El comando `expo prebuild` genera la carpeta `android/`.

Después también podés abrir esa carpeta directamente con Android Studio:

```text
Chang-APP/android
```

Para cambios solamente de TypeScript/JavaScript, normalmente alcanza con Metro/Expo. Si cambia configuración o una dependencia nativa, regenerar/recompilar el proyecto nativo.

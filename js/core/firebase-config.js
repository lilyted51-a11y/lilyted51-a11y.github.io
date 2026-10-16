/* ============ firebase-config.js — conexión con tu proyecto de Firebase ============
 * Pega aquí la configuración de tu app web de Firebase (Consola de Firebase >
 * Configuración del proyecto > Tus apps > SDK setup and configuration > Config).
 * Los pasos completos están en docs/FIREBASE.md.
 *
 * Estos datos NO son secretos: Firebase los diseña para ir en la web. Lo que
 * protege las partidas son las reglas de Firestore (firestore.rules).
 *
 * Si se pone a null, el juego funciona en modo local (sólo en el navegador).
 */
// Proyecto propio pokesurvivor-ming (desde el 16-10-2026): autenticación normal de
// Firebase, SIN Identity Platform y en el plan gratuito Spark. ¡No pulsar nunca
// "Actualizar a Identity Platform" ni "Actualizar a Blaze" en su consola!
G.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyByk_oJHsy3LQ37-lnia-uK7xZ1paeEg-E',
  authDomain: 'pokesurvivor-ming.firebaseapp.com',
  databaseURL: 'https://pokesurvivor-ming-default-rtdb.firebaseio.com',
  projectId: 'pokesurvivor-ming',
  storageBucket: 'pokesurvivor-ming.firebasestorage.app',
  messagingSenderId: '415318601673',
  appId: '1:415318601673:web:774669aa91172fdf92c218'
};

/* Ejemplo de cómo debe quedar:
G.FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123'
};
*/

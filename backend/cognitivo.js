// Cliente de la API del ingeniero. Reintenta si el servicio gratuito está despertando.
const ESTADOS_DE_ARRANQUE = [502, 503, 504];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function analizarComentario(comentario) {
  const url = process.env.COGNITIVE_URL;
  const llave = process.env.COGNITIVE_KEY;

  if (!url || !llave) {
    throw new Error('Faltan las variables de entorno COGNITIVE_URL y COGNITIVE_KEY');
  }

  let ultimoError;
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const respuesta = await fetch(`${url}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${llave}` },
        body: JSON.stringify({ contenido: comentario }),
        signal: AbortSignal.timeout(15000),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        return datos.resultado; // { etiqueta, confianza }
      }

      ultimoError = new Error(`La API del ingeniero respondió ${respuesta.status}`);
      ultimoError.status = respuesta.status;
      // 401, 422, etc. no se arreglan reintentando: falla de una vez
      if (!ESTADOS_DE_ARRANQUE.includes(respuesta.status)) throw ultimoError;
    } catch (error) {
      if (error.status && !ESTADOS_DE_ARRANQUE.includes(error.status)) throw error;
      ultimoError = error; // 502/503/504 o timeout: se reintenta
    }
    console.log(`Intento ${intento} falló (${ultimoError.message}). Reintentando...`);
    await esperar(8000);
  }
  throw ultimoError;
}

module.exports = { analizarComentario };
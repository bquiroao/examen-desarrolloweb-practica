async function analizarComentario(comentario) {
  const url = process.env.COGNITIVE_URL;
  const llave = process.env.COGNITIVE_KEY;

  if (!url || !llave) {
    throw new Error('Faltan las variables de entorno COGNITIVE_URL y COGNITIVE_KEY');
  }

  const respuesta = await fetch(`${url}/api/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${llave}` },
    body: JSON.stringify({ contenido: comentario }),
    signal: AbortSignal.timeout(10000),
  });

  if (!respuesta.ok) {
    const error = new Error(`La API del ingeniero respondió ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  const datos = await respuesta.json();
  return datos.resultado; // { etiqueta, confianza }
}

module.exports = { analizarComentario };
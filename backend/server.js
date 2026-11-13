const express = require('express');
const cors = require('cors');
const { analizarComentario } = require('./cognitivo');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const historial = [];

app.get('/', (req, res) => {
  res.json({ ok: true, servicio: 'backend-examen' });
});

app.post('/api/analizar', async (req, res) => {
  const comentario = String(req.body?.comentario ?? '').trim();

  if (!comentario) {
    return res.status(400).json({ error: 'El campo "comentario" es obligatorio' });
  }
  if (comentario.length > 1000) {
    return res.status(400).json({ error: 'El comentario no puede superar 1000 caracteres' });
  }

  try {
    const r = await analizarComentario(comentario);
    const resultado = {
      comentario,
      etiqueta: r.etiqueta,
      confianza: r.confianza,
      fecha: new Date().toISOString(),
    };
    historial.unshift(resultado);
    historial.splice(20);
    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar el servicio cognitivo:', error.message);
    res.status(502).json({ error: 'No se pudo consultar el servicio cognitivo' });
  }
});

app.get('/api/historial', (req, res) => {
  res.json(historial);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend escuchando en puerto ${PORT}`));
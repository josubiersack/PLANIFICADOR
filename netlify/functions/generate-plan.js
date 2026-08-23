exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "OPENROUTER_API_KEY no está configurada en las variables de entorno de Netlify." }) };
  }


  const { nivel, subnivel, asignatura, tema, tiempo, docente, institucion, grado, fecha } = JSON.parse(event.body);

  const prompt = `
Eres un experto en el currículo oficial del Ministerio de Educación del Ecuador.
Genera una planificación microcurricular COMPLETA y REAL para clase, usando ÚNICAMENTE 
elementos del currículo ecuatoriano oficial. NO inventes destrezas ni objetivos.

DATOS DE LA CLASE:
- Institución: ${institucion}
- Docente: ${docente}
- Nivel: ${nivel}
- Subnivel: ${subnivel}
- Grado/Curso: ${grado}
- Área/Asignatura: ${asignatura}
- Tema: ${tema}
- Tiempo: ${tiempo} minutos
- Fecha: ${fecha}

GENERA la planificación con esta estructura exacta en formato JSON:

{
  "datosInformativos": {
    "institucion": "",
    "docente": "",
    "area": "",
    "grado": "",
    "fecha": "",
    "tiempo": ""
  },
  "objetivoAprendizaje": "objetivo oficial del currículo ecuatoriano para esta área y nivel",
  "destrezas": [
    {
      "codigo": "código oficial ej: CN.2.1.3",
      "descripcion": "descripción oficial de la destreza"
    }
  ],
  "indicadoresEvaluacion": [
    "indicador 1",
    "indicador 2",
    "indicador 3"
  ],
  "ejesTransversales": "ejes transversales aplicables según el currículo",
  "metodologia": {
    "anticipacion": {
      "duracion": "10 minutos",
      "actividades": [
        "actividad detallada 1",
        "actividad detallada 2"
      ],
      "estrategia": "estrategia metodológica utilizada"
    },
    "construccion": {
      "duracion": "25 minutos",
      "actividades": [
        "actividad detallada 1",
        "actividad detallada 2",
        "actividad detallada 3"
      ],
      "estrategia": "estrategia metodológica utilizada"
    },
    "consolidacion": {
      "duracion": "10 minutos",
      "actividades": [
        "actividad detallada 1",
        "actividad detallada 2"
      ],
      "estrategia": "estrategia metodológica utilizada"
    }
  },
  "dua": {
    "representacion": "cómo se presenta la información para distintos estilos",
    "accionExpresion": "cómo el estudiante demuestra su aprendizaje",
    "motivacion": "cómo se mantiene el interés y participación"
  },
  "evaluacion": {
    "tecnicas": ["técnica 1", "técnica 2"],
    "instrumentos": ["instrumento 1", "instrumento 2"],
    "criterios": ["criterio 1", "criterio 2"],
    "evidencias": ["evidencia 1", "evidencia 2"]
  },
  "recursos": {
    "materialesFisicos": ["material 1", "material 2", "material 3"],
    "recursosDigitales": ["recurso 1", "recurso 2"]
  }
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin texto antes ni después
- Los códigos de destrezas deben ser reales del currículo ecuatoriano
- Las actividades deben ser concretas y aplicables en aula real
- Usa lenguaje claro para docentes ecuatorianos
- El tiempo total de actividades debe sumar exactamente ${tiempo} minutos
`;
  const modelos = [
    { id: "qwen/qwen-2.5-72b-instruct", maxTk: 3000 },
    { id: "qwen/qwen-2.5-7b-instruct", maxTk: 2000 },
  ];

  let lastError = null;
  for (const modelo of modelos) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelo.id,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: modelo.maxTk,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        lastError = `${modelo.id}: ${errBody?.error?.message || res.statusText}`;
        if (res.status === 429 || res.status === 413 || res.status === 400) continue;
        return { statusCode: res.status, body: JSON.stringify({ error: `Error OpenRouter (${res.status}): ${lastError}` }) };
      }
      const data = await res.json();
      const texto = data.choices[0].message.content;
      const limpio = texto.replace(/```json|```/g, "").trim();
      const planificacion = JSON.parse(limpio);
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(planificacion) };
    } catch (error) {
      lastError = `${modelo.id}: ${error?.message || String(error)}`;
      continue;
    }
  }
  return { statusCode: 429, body: JSON.stringify({ error: "Todos los modelos agotados. Intenta más tarde. " + lastError }) };
};
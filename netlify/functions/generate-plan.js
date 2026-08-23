const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey && !process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "No hay ninguna clave de API configurada. Agrega GEMINI_API_KEY, GROQ_API_KEY u OPENROUTER_API_KEY en las variables de entorno de Netlify." }) };
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
  let lastError = null;

  const devolver = (parsed) => ({ statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
  const parsear = (texto) => JSON.parse(texto.replace(/```json|```/g, "").trim());

  // 1) GEMINI (gratuito, sin tarjeta) — GEMINI_API_KEY
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModelos = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];
    for (const id of geminiModelos) {
      try {
        const model = genAI.getGenerativeModel({
          model: id,
          generationConfig: { temperature: 0.3, maxOutputTokens: 2500, responseMimeType: "application/json" },
        });
        const result = await model.generateContent(prompt);
        return devolver(parsear(result.response.text()));
      } catch (error) {
        lastError = `Gemini ${id}: ${error?.message || String(error)}`;
      }
    }
  }

  // 2) GROQ (gratuito con límites) — GROQ_API_KEY
  if (process.env.GROQ_API_KEY) {
    const groqModelos = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
    for (const id of groqModelos) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: id, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 2500, response_format: { type: "json_object" } }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          lastError = `Groq ${id}: ${errBody?.error?.message || res.statusText}`;
          continue;
        }
        const data = await res.json();
        return devolver(parsear(data.choices[0].message.content));
      } catch (error) {
        lastError = `Groq ${id}: ${error?.message || String(error)}`;
      }
    }
  }

  // 3) OPENROUTER (respaldo final) — OPENROUTER_API_KEY
  if (apiKey) {
    const modelos = [
      { id: "deepseek/deepseek-v4-flash", maxTk: 2500 },
      { id: "qwen/qwen3-30b-a3b", maxTk: 2000 },
      { id: "qwen/qwen-2.5-7b-instruct", maxTk: 1500 },
    ];
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
        return devolver(parsear(data.choices[0].message.content));
      } catch (error) {
        lastError = `${modelo.id}: ${error?.message || String(error)}`;
      }
    }
  }
  return { statusCode: 429, body: JSON.stringify({ error: "Todos los proveedores agotados. Intenta más tarde. " + lastError }) };
};
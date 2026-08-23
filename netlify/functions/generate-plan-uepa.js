const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey && !process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "No hay ninguna clave de API configurada. Agrega GEMINI_API_KEY, GROQ_API_KEY u OPENROUTER_API_KEY en las variables de entorno de Netlify." }) };
  }

  const { asignatura, curso, semana, dias, tema, tiempo, diagnostico, tipo, grado, esNEE, detallesPorDia, nombreEstudiante } = JSON.parse(event.body);

  const duraciones = {
    "35": { inicio: "10 MIN", desarrollo: "15 MIN", cierre: "10 MIN" },
    "40": { inicio: "10 MIN", desarrollo: "20 MIN", cierre: "10 MIN" },
  };
  const dur = duraciones[tiempo] || duraciones["40"];

  let prompt;

  if (esNEE) {
    const temas = tema ? tema.split("-").map(t => t.trim()).filter(t => t) : [];
    const temasInfo = temas.length > 1
      ? `Los temas de la semana son (en orden, uno por día):\n${temas.map((t, i) => `  ${i+1}. ${t}`).join("\n")}\nAsigna cada tema al día correspondiente en orden.`
      : `El tema de la clase es: ${tema}`;

    prompt = `
Eres un docente experto en Adaptaciones Curriculares para estudiantes con NEE de la Unidad Educativa Particular Americano de Manta, Ecuador.

Genera contenido ADAPTADO para el/la estudiante NEE:
- Nombre del estudiante: ${nombreEstudiante || "No especificado"}
- Asignatura: ${asignatura}
- Curso: ${curso}
- ${temasInfo}
- Diagnóstico: ${diagnostico || "No especificado"}
- Tipo: ${tipo || "Transitoria"}
- Grado de adaptación: ${grado || "Grado 2"}
- Tiempo: ${tiempo || 40} minutos

IMPORTANTE CRÍTICO: Las actividades deben estar ESPECÍFICAMENTE ADAPTADAS al diagnóstico "${diagnostico}" de este estudiante. 
Cada diagnóstico requiere estrategias DIFERENTES. Por ejemplo: TDAH necesita actividades cortas y dinámicas, Autismo necesita rutinas visuales claras, Discalculia necesita material concreto para matemáticas, etc.
NO generes contenido genérico. El contenido DEBE ser ÚNICO para el diagnóstico "${diagnostico}".

REGLAS DE FORMATO:
- El campo "contenido" debe contener ÚNICAMENTE el nombre del tema (ej: "El plano cartesiano", "Ecuaciones lineales"). Solo el tema, nada más.
- El campo "actividades" es donde va la EXPLICACIÓN de lo que se hará en clase: 3-4 frases concretas y detalladas que expliquen paso a paso qué hará el docente, qué hará el estudiante, qué materiales usará, cómo se adapta al diagnóstico, etc.

${temas.length > 1 ? 'Usa el tema correspondiente para cada día en orden.' : ''}
Responde ÚNICAMENTE con JSON, sin texto adicional, sin markdown.

{
  "dias": {
    ${dias.map((dia, idx) => `"${dia}": {
      "hora": "",
      "inicio": {
        "contenido": "${temas[idx] || temas[0] || tema}",
        "actividades": "Escribe aquí mínimo 4 líneas detalladas explicando la actividad de inicio adaptada al diagnóstico ${diagnostico || 'del estudiante'} sobre ${temas[idx] || temas[0] || tema}",
        "duracion": "${dur.inicio}",
        "recursos": "recursos accesibles",
        "tecnica": "técnica inclusiva",
        "instrumento": "instrumento adaptado"
      },
      "desarrollo": {
        "contenido": "${temas[idx] || temas[0] || tema}",
        "actividades": "Escribe aquí mínimo 4 líneas detalladas explicando la actividad de desarrollo adaptada sobre ${temas[idx] || temas[0] || tema}, con ejercicios, explicaciones y trabajo adaptado",
        "duracion": "${dur.desarrollo}",
        "recursos": "material concreto / visual",
        "tecnica": "técnica diferenciada",
        "instrumento": "guía adaptada"
      },
      "cierre": {
        "contenido": "${temas[idx] || temas[0] || tema}",
        "actividades": "Escribe aquí mínimo 4 líneas detalladas explicando la actividad de cierre adaptada sobre ${temas[idx] || temas[0] || tema}, retroalimentación y consolidación",
        "duracion": "${dur.cierre}",
        "recursos": "recursos accesibles",
        "tecnica": "retroalimentación personalizada",
        "instrumento": "rúbrica adaptada"
      }
    }`).join(",\n")}
  }
}

IMPORTANTE: Responde SOLO el JSON. "contenido" = SOLO el nombre del tema. "actividades" = 3-4 frases concretas de lo que se hará en clase. Contenido ADAPTADO de ${asignatura} para ${curso}.${temas.length > 1 ? ' Usa los temas proporcionados en orden.' : ''}
`;
  } else {
    const temas = tema ? tema.split("-").map(t => t.trim()).filter(t => t) : [];
    const temasInfo = temas.length > 0
      ? `Los temas de la semana son (en orden, uno por día):\n${temas.map((t, i) => `  ${i+1}. ${t}`).join("\n")}\nAsigna cada tema al día correspondiente en orden. Si hay más días que temas, repite o profundiza el último tema. Si hay más temas que días, agrupa los sobrantes en el último día.`
      : "Genera temas apropiados de la asignatura para cada día.";

    const detallesInfo = detallesPorDia ? dias.map(dia => {
      const det = detallesPorDia[dia];
      return det ? `  - ${dia}: ${det}` : null;
    }).filter(Boolean).join("\n") : "";

    prompt = `
Eres un docente experto de la Unidad Educativa Particular Americano de Manta, Ecuador.
Genera contenido para un Plan Diario semanal de ${asignatura} para el curso ${curso}, semana ${semana}.

${temasInfo}
${detallesInfo ? `\nDETALLES ESPECÍFICOS del docente sobre lo que se hará en cada clase (usa esta información para enriquecer las ACTIVIDADES):\n${detallesInfo}\n` : ""}
Tiempo de clase: ${tiempo || 40} minutos por día.

REGLAS DE FORMATO OBLIGATORIAS:
1. El campo "contenido" debe contener ÚNICAMENTE el nombre del tema de esa fase (ej: "El plano cartesiano", "Ecuaciones lineales"). Solo el tema corto, NO explicaciones.
2. El campo "actividades" es donde va la EXPLICACIÓN de lo que se realizará en la clase: 3-4 frases concretas y detalladas que expliquen:
   - Qué hará el docente (explicar, demostrar, guiar)
   - Qué harán los estudiantes (ejercicios, trabajo en libro, práctica)
   - Si el docente indicó detalles específicos (página del libro, tipo de ejercicio), incorpóralos
   - Cómo se desarrolla paso a paso la actividad

Responde ÚNICAMENTE con JSON, sin texto adicional, sin markdown.

{
  "dias": {
    ${dias.map((dia, idx) => {
      const detalle = detallesPorDia && detallesPorDia[dia] ? detallesPorDia[dia] : "";
      const temaDia = temas[idx] || temas[0] || "tema del día";
      return `"${dia}": {
      "hora": "",
      "inicio": {
        "contenido": "${temaDia}",
        "actividades": "Escribe mínimo 4 líneas detalladas explicando la actividad de inicio sobre ${temaDia}${detalle ? '. Detalles del docente: ' + detalle : ''}. Describe paso a paso qué hará el docente y los estudiantes",
        "duracion": "${dur.inicio}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      },
      "desarrollo": {
        "contenido": "${temaDia}",
        "actividades": "Escribe mínimo 4 líneas detalladas explicando la actividad de desarrollo sobre ${temaDia}${detalle ? '. Detalles del docente: ' + detalle : ''}. Describe ejercicios, explicaciones, trabajo en clase paso a paso",
        "duracion": "${dur.desarrollo}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      },
      "cierre": {
        "contenido": "${temaDia}",
        "actividades": "Escribe mínimo 4 líneas detalladas explicando la actividad de cierre sobre ${temaDia}${detalle ? '. Detalles del docente: ' + detalle : ''}. Describe consolidación y retroalimentación",
        "duracion": "${dur.cierre}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      }
    }`;
    }).join(",\n")}
  }
}

IMPORTANTE: Responde SOLO el JSON. "contenido" = SOLO el nombre del tema (corto). "actividades" = 3-4 frases concretas de lo que se hará en clase. Contenido real de ${asignatura} para ${curso}. ${temas.length > 0 ? 'Usa los temas proporcionados en orden.' : ''}
`;
  }

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
          generationConfig: { temperature: 0.3, maxOutputTokens: 3000, responseMimeType: "application/json" },
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
          body: JSON.stringify({ model: id, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 3000, response_format: { type: "json_object" } }),
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
      { id: "deepseek/deepseek-v4-flash", maxTk: 3000 },
      { id: "qwen/qwen3-30b-a3b", maxTk: 2500 },
      { id: "qwen/qwen-2.5-7b-instruct", maxTk: 2000 },
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
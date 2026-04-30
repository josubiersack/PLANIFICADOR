const Groq = require("groq-sdk");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY no está configurada en las variables de entorno de Netlify." }) };
  }
  const groq = new Groq({ apiKey });

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
- El campo "actividades" es donde va la EXPLICACIÓN DETALLADA de lo que se hará en clase. MÍNIMO 4 líneas descriptivas explicando paso a paso qué hará el docente, qué hará el estudiante, qué materiales usará, cómo se adapta al diagnóstico, etc.

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

IMPORTANTE: Responde SOLO el JSON. "contenido" = SOLO el nombre del tema. "actividades" = explicación detallada de mínimo 4 líneas. Contenido ADAPTADO de ${asignatura} para ${curso}.${temas.length > 1 ? ' Usa los temas proporcionados en orden.' : ''}
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
2. El campo "actividades" es donde va la EXPLICACIÓN DETALLADA de lo que se realizará en la clase. MÍNIMO 4 líneas descriptivas que expliquen:
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

IMPORTANTE: Responde SOLO el JSON. "contenido" = SOLO el nombre del tema (corto). "actividades" = explicación detallada de mínimo 4 líneas de lo que se hará en clase. Contenido real de ${asignatura} para ${curso}. ${temas.length > 0 ? 'Usa los temas proporcionados en orden.' : ''}
`;
  }

  // Modelos de respaldo — solo modelos vigentes en Groq 2026
  const modelos = [
    { id: "meta-llama/llama-3.3-70b-versatile", maxTk: 4500 },
    { id: "meta-llama/llama-4-scout-17b-16e-instruct", maxTk: 4500 },
    { id: "qwen/qwen3-32b", maxTk: 4000 },
    { id: "meta-llama/llama-3.1-8b-instant", maxTk: 2500 },
  ];

  let lastError = null;
  for (const modelo of modelos) {
    try {
      const response = await groq.chat.completions.create({
        model: modelo.id,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: modelo.maxTk,
        response_format: { type: "json_object" },
      });
      const texto = response.choices[0].message.content;
      const limpio = texto.replace(/```json|```/g, "").trim();
      let data;
      try {
        data = JSON.parse(limpio);
      } catch (parseErr) {
        lastError = "JSON inválido con " + modelo.id;
        continue;
      }
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
    } catch (error) {
      const status = error?.status || error?.statusCode || 500;
      lastError = `${modelo.id}: ${error?.error?.message || error?.message || String(error)}`;
      if (status === 429 || status === 413 || status === 400) continue;
      return { statusCode: status, body: JSON.stringify({ error: `Error Groq (${status}): ${lastError}` }) };
    }
  }
  return { statusCode: 429, body: JSON.stringify({ error: "Todos los modelos agotados. Intenta en 1-2 horas. " + lastError }) };
};
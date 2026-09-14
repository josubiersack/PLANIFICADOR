exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey && !process.env.GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "No hay ninguna clave de API configurada. Agrega GROQ_API_KEY u OPENROUTER_API_KEY en las variables de entorno de Netlify." }) };
  }

  const { asignatura, curso, semana, dias, tema, tiempo, diagnostico, tipo, grado, esNEE, detallesPorDia, nombreEstudiante } = JSON.parse(event.body);

  const duraciones = {
    "35": { inicio: "10 MIN", desarrollo: "15 MIN", cierre: "10 MIN" },
    "40": { inicio: "10 MIN", desarrollo: "20 MIN", cierre: "10 MIN" },
  };
  const dur = duraciones[tiempo] || duraciones["40"];

  // Victor Reyes (INGLÉS) planifica con su propio formato: 5/30/5 minutos
  const esIngles = String(asignatura || "").toUpperCase().includes("INGLÉS");
  if (esIngles) {
    dur.inicio = "5 MIN";
    dur.desarrollo = "30 MIN";
    dur.cierre = "5 MIN";
  }

  // Estilo de planificación extraído de los planes reales de INGLÉS (carpeta INGLES)
  const estiloIngles = esIngles ? `
ESTILO DE PLANIFICACIÓN DEL DOCENTE DE INGLÉS (OBLIGATORIO, imitar sus planes reales):
- "contenido": código de unidad con título en inglés, ej: "3.8 Evaluation – Explore and Review.", "4.1 Vocabulary Review – Adjectives.", "3.6 Meeting Point – I Respect the Rules of my Neighborhood."
- "actividades": cada línea empieza con "• " y describe acciones concretas: saludo inicial en inglés, repaso visual, desarrollo de páginas del libro de inglés (indicar número de página), lectura y completación, vocabulario nuevo, socialización, corrección grupal, feedback.
- "duracion": Inicio "5 MIN", Desarrollo "30 MIN", Cierre "5 MIN".
- "recursos": PIZARRA, MARCADORES, LIBRO DE INGLÉS (PAG XX), CARPETA; agregar HOJAS DE TRABAJO o SALA DE PROYECCIÓN si aplica.
- Evaluación: Inicio → técnica "OBSERVACIÓN DIRECTA", instrumento "-". Desarrollo → técnica "PRODUCCIÓN ORAL Y ESCRITA", instrumento "LIBRO DE INGLÉS". Cierre → técnica "PARTICIPACIÓN ORAL", instrumento "-".
` : "";

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

${temas.length > 1 ? 'Usa el tema correspondiente para cada día en orden.' : ''}${estiloIngles}
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
${estiloIngles}
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

  const validarDias = (parsed, id) => {
    const faltantes = dias.filter(d => !parsed.dias || !parsed.dias[d]);
    if (faltantes.length > 0) {
      lastError = `${id}: faltan días ${faltantes.join(", ")}`;
      return false;
    }
    return true;
  };

  // 1) GROQ (gratuito) — GROQ_API_KEY
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 5000, response_format: { type: "json_object" } }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        lastError = `Groq: ${errBody?.error?.message || res.statusText}`;
      } else {
        const data = await res.json();
        const parsed = parsear(data.choices[0].message.content);
        if (validarDias(parsed, "Groq")) return devolver(parsed);
      }
    } catch (error) {
      lastError = `Groq: ${error?.message || String(error)}`;
    }
  }

  // 2) OPENROUTER Qwen (respaldo) — OPENROUTER_API_KEY
  if (apiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "qwen/qwen3-30b-a3b", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 6000, response_format: { type: "json_object" } }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        lastError = `Qwen: ${errBody?.error?.message || res.statusText}`;
        if (res.status !== 429 && res.status !== 413 && res.status !== 400) {
          return { statusCode: res.status, body: JSON.stringify({ error: `Error OpenRouter (${res.status}): ${lastError}` }) };
        }
      } else {
        const data = await res.json();
        const parsed = parsear(data.choices[0].message.content);
        if (validarDias(parsed, "Qwen")) return devolver(parsed);
      }
    } catch (error) {
      lastError = `Qwen: ${error?.message || String(error)}`;
    }
  }
  return { statusCode: 429, body: JSON.stringify({ error: "Todos los proveedores agotados. Intenta más tarde. " + lastError }) };
};
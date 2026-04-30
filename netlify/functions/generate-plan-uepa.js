const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const { asignatura, curso, semana, dias, tema, tiempo, diagnostico, tipo, grado, esNEE } = JSON.parse(event.body);

  const duraciones = {
    "35": { inicio: "10 MIN", desarrollo: "15 MIN", cierre: "10 MIN" },
    "40": { inicio: "10 MIN", desarrollo: "20 MIN", cierre: "10 MIN" },
  };
  const dur = duraciones[tiempo] || duraciones["40"];

  let prompt;

  if (esNEE) {
    // Parsear temas separados por guión para NEE
    const temas = tema ? tema.split("-").map(t => t.trim()).filter(t => t) : [];
    const temasInfo = temas.length > 1
      ? `Los temas de la semana son (en orden, uno por día):\n${temas.map((t, i) => `  ${i+1}. ${t}`).join("\n")}\nAsigna cada tema al día correspondiente en orden.`
      : `El tema de la clase es: ${tema}`;

    prompt = `
Eres un docente experto en Adaptaciones Curriculares para estudiantes con Necesidades Educativas Especiales (NEE) de la Unidad Educativa Particular Americano de Manta, Ecuador.

Genera contenido ADAPTADO para un estudiante NEE con las siguientes características:
- Asignatura: ${asignatura}
- Curso: ${curso}
- ${temasInfo}
- Diagnóstico: ${diagnostico || "No especificado"}
- Tipo de adaptación: ${tipo || "Transitoria"}
- Grado de adaptación: ${grado || "Grado 2"}
- Tiempo total de clase: ${tiempo || 40} minutos

IMPORTANTE: Las actividades deben estar ADAPTADAS al diagnóstico del estudiante. 
Usa estrategias diferenciadas, materiales concretos, instrucciones simplificadas según corresponda.
${temas.length > 1 ? 'Usa el tema correspondiente para cada día en orden.' : ''}
Responde ÚNICAMENTE con JSON, sin texto adicional, sin markdown.

{
  "dias": {
    ${dias.map((dia, idx) => `"${dia}": {
      "hora": "",
      "inicio": {
        "contenido": "contenido adaptado sobre ${temas[idx] || temas[0] || tema}",
        "actividades": "actividad de inicio adaptada al diagnóstico",
        "duracion": "${dur.inicio}",
        "recursos": "recursos accesibles",
        "tecnica": "técnica inclusiva",
        "instrumento": "instrumento adaptado"
      },
      "desarrollo": {
        "contenido": "contenido adaptado sobre ${temas[idx] || temas[0] || tema}",
        "actividades": "actividad de desarrollo adaptada",
        "duracion": "${dur.desarrollo}",
        "recursos": "material concreto / visual",
        "tecnica": "técnica diferenciada",
        "instrumento": "guía adaptada"
      },
      "cierre": {
        "contenido": "contenido adaptado sobre ${temas[idx] || temas[0] || tema}",
        "actividades": "actividad de cierre adaptada",
        "duracion": "${dur.cierre}",
        "recursos": "recursos accesibles",
        "tecnica": "retroalimentación personalizada",
        "instrumento": "rúbrica adaptada"
      }
    }`).join(",\n")}
  }
}

IMPORTANTE: Responde SOLO el JSON. Contenido ADAPTADO de ${asignatura} para nivel ${curso}, considerando el diagnóstico ${diagnostico || "del estudiante"}.${temas.length > 1 ? ' Usa los temas proporcionados para cada día en orden.' : ''}
`;
  } else {
    // Parsear temas separados por guión
    const temas = tema ? tema.split("-").map(t => t.trim()).filter(t => t) : [];
    const temasInfo = temas.length > 0
      ? `Los temas de la semana son (en orden, uno por día):\n${temas.map((t, i) => `  ${i+1}. ${t}`).join("\n")}\nAsigna cada tema al día correspondiente en orden. Si hay más días que temas, repite o profundiza el último tema. Si hay más temas que días, agrupa los sobrantes en el último día.`
      : "Genera temas apropiados de la asignatura para cada día.";

    prompt = `
Eres un docente experto de la Unidad Educativa Particular Americano de Manta, Ecuador.
Genera contenido para un Plan Diario semanal de ${asignatura} para el curso ${curso}, semana ${semana}.

${temasInfo}

Tiempo de clase: ${tiempo || 40} minutos por día.

Para cada día indicado, genera contenido educativo real, específico y detallado.
Responde ÚNICAMENTE con JSON, sin texto adicional, sin markdown.

{
  "dias": {
    ${dias.map((dia, idx) => `"${dia}": {
      "hora": "",
      "inicio": {
        "contenido": "${temas[idx] || 'tema del día'}",
        "actividades": "actividad de inicio detallada sobre ${temas[idx] || 'el tema'}",
        "duracion": "${dur.inicio}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      },
      "desarrollo": {
        "contenido": "${temas[idx] || 'tema del día'}",
        "actividades": "actividad de desarrollo detallada sobre ${temas[idx] || 'el tema'}",
        "duracion": "${dur.desarrollo}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      },
      "cierre": {
        "contenido": "${temas[idx] || 'tema del día'}",
        "actividades": "actividad de cierre detallada sobre ${temas[idx] || 'el tema'}",
        "duracion": "${dur.cierre}",
        "recursos": "recursos específicos",
        "tecnica": "técnica de evaluación",
        "instrumento": "instrumento de evaluación"
      }
    }`).join(",\n")}
  }
}

IMPORTANTE: Responde SOLO el JSON. Contenido real de ${asignatura} para nivel ${curso}. ${temas.length > 0 ? 'Usa los temas proporcionados para cada día en orden.' : ''}
`;
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });
    const texto = response.choices[0].message.content;
    const limpio = texto.replace(/```json|```/g, "").trim();
    const data = JSON.parse(limpio);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
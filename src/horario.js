export const HORAS_CLASE = ["1RA","2DA","3RA","4TA","5TA","6TA","7MA","8VA"];

export const DIAS_ORDEN = ["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES"];

// Horario de LIC. KEVIN BARRETO SOLEDISPA — LENGUAJE
// El receso (10:50–11:20) NO se incluye: no es una hora pedagógica contable.
export const HORARIO_KEVIN = [
  // LUNES
  { dia: "LUNES", hora: 1, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "LUNES", hora: 2, curso: "PRIMERO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "LUNES", hora: 3, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "LUNES", hora: 4, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "LUNES", hora: 5, curso: "SEGUNDO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "LUNES", hora: 6, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 35 },
  { dia: "LUNES", hora: 7, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 35 },
  // MARTES
  { dia: "MARTES", hora: 1, curso: "TERCERO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "MARTES", hora: 2, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "MARTES", hora: 3, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "MARTES", hora: 4, curso: "SEGUNDO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "MARTES", hora: 5, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "MARTES", hora: 6, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 35 },
  { dia: "MARTES", hora: 7, curso: "PRIMERO BGU", materia: "LENGUAJE", duracion: 35 },
  // MIÉRCOLES
  { dia: "MIÉRCOLES", hora: 1, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 2, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 3, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 4, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 5, curso: "SEGUNDO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 6, curso: "PRIMERO BGU", materia: "LENGUAJE", duracion: 35 },
  { dia: "MIÉRCOLES", hora: 7, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 35 },
  { dia: "MIÉRCOLES", hora: 8, curso: "TERCERO BGU", materia: "LENGUAJE", duracion: 35 },
  // JUEVES
  { dia: "JUEVES", hora: 1, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "JUEVES", hora: 2, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "JUEVES", hora: 3, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "JUEVES", hora: 4, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "JUEVES", hora: 5, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "JUEVES", hora: 6, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 35 },
  { dia: "JUEVES", hora: 7, curso: "SEGUNDO BGU", materia: "LENGUAJE", duracion: 35 },
  { dia: "JUEVES", hora: 8, curso: "PRIMERO BGU", materia: "LENGUAJE", duracion: 35 },
  // VIERNES
  { dia: "VIERNES", hora: 1, curso: "NOVENO EGB A", materia: "LENGUAJE", duracion: 40 },
  { dia: "VIERNES", hora: 2, curso: "DÉCIMO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "VIERNES", hora: 3, curso: "PRIMERO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "VIERNES", hora: 4, curso: "TERCERO BGU", materia: "LENGUAJE", duracion: 40 },
  { dia: "VIERNES", hora: 5, curso: "NOVENO EGB B", materia: "LENGUAJE", duracion: 40 },
  { dia: "VIERNES", hora: 6, curso: "SEGUNDO BGU", materia: "LENGUAJE", duracion: 35 },
  { dia: "VIERNES", hora: 7, curso: "DÉCIMO EGB A", materia: "LENGUAJE", duracion: 35 },
];

export const CURSOS_JOSUE = ["OCTAVO EGB A","OCTAVO EGB B","NOVENO EGB A","NOVENO EGB B","DÉCIMO EGB A","DÉCIMO EGB B","PRIMERO BGU","SEGUNDO BGU","TERCERO BGU"];

export const CURSOS_KEVIN = ["NOVENO EGB A","NOVENO EGB B","DÉCIMO EGB A","DÉCIMO EGB B","PRIMERO BGU","SEGUNDO BGU","TERCERO BGU"];

// Configuración centralizada y escalable de docentes.
// Cada docente define sus materias, cursos y horario propios.
export const DOCENTES = {
  "LIC. JOSUÉ CRUZ ZAMBRANO": {
    materias: ["MATEMÁTICAS","ROBÓTICA","PPE - PROGRAMA DE PARTICIPACIÓN ESTUDIANTIL","LABORATORIO DE QUÍMICA"],
    cursos: CURSOS_JOSUE,
    horario: "JOSUE",
  },
  "LIC. KEVIN BARRETO SOLEDISPA": {
    materias: ["LENGUAJE"],
    cursos: CURSOS_KEVIN,
    horario: "KEVIN",
  },
};

const HORARIOS = { JOSUE: null, KEVIN: HORARIO_KEVIN };

export const HORARIO_COMPLETO = [
  // LUNES
  { dia: "LUNES", hora: 1, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "LUNES", hora: 2, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "LUNES", hora: 3, curso: "TERCERO BGU", materia: "LABORATORIO", duracion: 40 },
  { dia: "LUNES", hora: 4, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "LUNES", hora: 5, curso: "TERCERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "LUNES", hora: 6, curso: "SEGUNDO BGU", materia: "MATEMÁTICAS", duracion: 35 },
  { dia: "LUNES", hora: 7, curso: "SEGUNDO BGU", materia: "MATEMÁTICAS", duracion: 35 },
  { dia: "LUNES", hora: 8, curso: "PRIMERO BGU", materia: "LABORATORIO", duracion: 35 },
  // MARTES
  { dia: "MARTES", hora: 1, curso: "SEGUNDO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MARTES", hora: 2, curso: "SEGUNDO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MARTES", hora: 3, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MARTES", hora: 4, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MARTES", hora: 5, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MARTES", hora: 6, curso: "PRIMERO BGU", materia: "PPE", duracion: 35 },
  { dia: "MARTES", hora: 7, curso: "TERCERO BGU", materia: "MATEMÁTICAS", duracion: 35 },
  // MIÉRCOLES
  { dia: "MIÉRCOLES", hora: 1, curso: "SEGUNDO BGU", materia: "PPE", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 2, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 3, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 4, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 5, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIÉRCOLES", hora: 6, curso: "SEGUNDO BGU", materia: "LABORATORIO", duracion: 35 },
  { dia: "MIÉRCOLES", hora: 7, curso: "TERCERO BGU", materia: "MATEMÁTICAS", duracion: 35 },
  // JUEVES
  { dia: "JUEVES", hora: 1, curso: "SEGUNDO BGU", materia: "PPE", duracion: 40 },
  { dia: "JUEVES", hora: 2, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "JUEVES", hora: 3, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "JUEVES", hora: 4, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "JUEVES", hora: 5, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "JUEVES", hora: 6, curso: "OCTAVO EGB A", materia: "ROBÓTICA", duracion: 35 },
  { dia: "JUEVES", hora: 7, curso: "TERCERO BGU", materia: "MATEMÁTICAS", duracion: 35 },
  // VIERNES
  { dia: "VIERNES", hora: 1, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "VIERNES", hora: 2, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "VIERNES", hora: 3, curso: "SEGUNDO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "VIERNES", hora: 4, curso: "PRIMERO BGU", materia: "PPE", duracion: 40 },
  { dia: "VIERNES", hora: 5, curso: "OCTAVO EGB B", materia: "ROBÓTICA", duracion: 40 },
  { dia: "VIERNES", hora: 6, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 35 },
];

const CURSO_MAP = {
  "8VO EGB A": "OCTAVO EGB A",
  "8VO EGB B": "OCTAVO EGB B",
  "9NO EGB A": "NOVENO EGB A",
  "9NO EGB B": "NOVENO EGB B",
  "10MO EGB": "DÉCIMO EGB A",
  "10MO EGB B": "DÉCIMO EGB B",
  "1ERO BGU": "PRIMERO BGU",
  "2DO BGU": "SEGUNDO BGU",
  "3ERO BGU": "TERCERO BGU",
};

const MATERIA_MAP = {
  "PPE - PROGRAMA DE PARTICIPACIÓN ESTUDIANTIL": "PPE",
  "LABORATORIO DE QUÍMICA": "LABORATORIO",
};

export function normalizarCurso(curso) {
  if (!curso) return "";
  const c = String(curso).trim().toUpperCase();
  return CURSO_MAP[c] || c;
}

export function normalizarMateria(materia) {
  if (!materia) return "";
  const m = String(materia).trim();
  return MATERIA_MAP[m] || m.toUpperCase();
}

export function esMateriaLenguaje(materia) {
  const m = String(materia || "").toLowerCase();
  return m.includes("lenguaje") || m.includes("lengua");
}

export function obtenerClases(curso, materia, horarioKey) {
  const c = normalizarCurso(curso);
  const m = normalizarMateria(materia);
  if (!c || !m) return [];
  const horario = horarioKey === "KEVIN" ? HORARIO_KEVIN : HORARIO_COMPLETO;
  return horario.filter(clase => clase.curso === c && clase.materia === m);
}

export function getDuracionPorHora(hora) {
  if (hora >= 1 && hora <= 5) return 40;
  if (hora >= 6 && hora <= 8) return 35;
  return 40;
}

export function horaLabel(hora) {
  return HORAS_CLASE[hora - 1] || "";
}

export function autoseleccionar(curso, materia, horarioKey) {
  const clases = obtenerClases(curso, materia, horarioKey);
  if (clases.length === 0) {
    console.log("🔍 autoseleccionar (sin coincidencias):", { curso, materia, normalizado: normalizarCurso(curso) + " / " + normalizarMateria(materia) });
    return { dias: [], horas: [], clases: [] };
  }
  const diasSet = new Set();
  const horasSet = new Set();
  clases.forEach(({ dia, hora }) => {
    diasSet.add(dia);
    horasSet.add(hora);
  });
  const dias = DIAS_ORDEN.filter(d => diasSet.has(d));
  const horas = Array.from(horasSet).sort((a, b) => a - b);
  console.log("🔍 autoseleccionar:", { cursoOriginal: curso, materiaOriginal: materia, cursoNormalizado: normalizarCurso(curso), materiaNormalizada: normalizarMateria(materia), clasesEncontradas: clases.length, dias, horas });
  return { dias, horas, clases };
}

export const HORAS_CLASE = ["1RA","2DA","3RA","4TA","5TA","6TA","7MA","8VA"];

export const DIAS_ORDEN = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES"];

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
  // MIERCOLES
  { dia: "MIERCOLES", hora: 1, curso: "SEGUNDO BGU", materia: "PPE", duracion: 40 },
  { dia: "MIERCOLES", hora: 2, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIERCOLES", hora: 3, curso: "NOVENO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIERCOLES", hora: 4, curso: "OCTAVO EGB B", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIERCOLES", hora: 5, curso: "PRIMERO BGU", materia: "MATEMÁTICAS", duracion: 40 },
  { dia: "MIERCOLES", hora: 6, curso: "SEGUNDO BGU", materia: "LABORATORIO", duracion: 35 },
  { dia: "MIERCOLES", hora: 7, curso: "TERCERO BGU", materia: "MATEMÁTICAS", duracion: 35 },
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

export function obtenerClases(curso, materia) {
  const c = normalizarCurso(curso);
  const m = normalizarMateria(materia);
  if (!c || !m) return [];
  return HORARIO_COMPLETO.filter(clase => clase.curso === c && clase.materia === m);
}

export function getDuracionPorHora(hora) {
  if (hora >= 1 && hora <= 5) return 40;
  if (hora >= 6 && hora <= 8) return 35;
  return 40;
}

export function horaLabel(hora) {
  return HORAS_CLASE[hora - 1] || "";
}

export function autoseleccionar(curso, materia) {
  const clases = obtenerClases(curso, materia);
  if (clases.length === 0) return { dias: [], horas: [], clases: [] };
  const diasSet = new Set();
  const horasSet = new Set();
  clases.forEach(({ dia, hora }) => {
    diasSet.add(dia);
    horasSet.add(hora);
  });
  const dias = DIAS_ORDEN.filter(d => diasSet.has(d));
  const horas = Array.from(horasSet).sort((a, b) => a - b);
  return { dias, horas, clases };
}

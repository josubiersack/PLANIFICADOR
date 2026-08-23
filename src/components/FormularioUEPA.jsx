import React, { useState, useEffect, useCallback } from "react";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ImageRun, VerticalAlign
} from "docx";
import ExcelJS from "exceljs";
import html2pdf from "html2pdf.js";
import { autoseleccionar, getDuracionPorHora, esMateriaLenguaje, horaLabel } from "../horario";

const HORAS_CLASE = ["1RA","2DA","3RA","4TA","5TA","6TA","7MA","8VA"];

const CURSOS = ["OCTAVO EGB A","OCTAVO EGB B","NOVENO EGB A","NOVENO EGB B","DÉCIMO EGB A","DÉCIMO EGB B","PRIMERO BGU","SEGUNDO BGU","TERCERO BGU"];
const ASIGNATURAS = ["MATEMÁTICAS","LENGUAJE","ROBÓTICA","PPE - PROGRAMA DE PARTICIPACIÓN ESTUDIANTIL","LABORATORIO DE QUÍMICA"];
const DIAS_SEMANA = ["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES"];
const TRIMESTRES = ["PRIMER","SEGUNDO","TERCER"];
const TIEMPOS_CLASE = [
  { valor: "35", label: "35 minutos", inicio: "10 MIN", desarrollo: "15 MIN", cierre: "10 MIN" },
  { valor: "40", label: "40 minutos", inicio: "10 MIN", desarrollo: "20 MIN", cierre: "10 MIN" },
];

const CATALOGO_NEE = [
  { nombre: "INDACOCHEA ZAMBRANO CRISTHIAN JOSUE", curso: "8VO EGB A", diagnostico: "HIPERACTIVIDAD", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "IGLESIAS LOOR SANTIAGO DAER", curso: "8VO EGB A", diagnostico: "EN PROCESO", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "OZAETA MARCILLO MIGUEL ANGEL", curso: "8VO EGB A", diagnostico: "TDAH", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "MENDOZA CEVALLOS DANNA KIARELY", curso: "8VO EGB B", diagnostico: "TRASTORNO DE DÉFICIT DE ATENCIÓN", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "MACIAS ZAMBRANO CRISTHOPER RAFAEL", curso: "8VO EGB B", diagnostico: "AUTISMO", tipo: "Permanente", grado: "Grado 2" },
  { nombre: "INTRIAGO ARAGUNDI LIAM JAMES", curso: "8VO EGB B", diagnostico: "DIFICULTADES EN LA CONCENTRACIÓN", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "MEDRANDA BRAVO CARLA RAFAELA", curso: "9NO EGB A", diagnostico: "DISCAPACIDAD INTELECTUAL", tipo: "Permanente", grado: "Grado 3" },
  { nombre: "MORALES RIVERA MIKAEL ALEJANDRO", curso: "9NO EGB A", diagnostico: "EN PROCESO", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "VELEZ VERA ISAAC GABRIEL", curso: "10MO EGB", diagnostico: "TRASTORNOS DE APRENDIZAJE (DISLEXIA Y DISCALCULIA)", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "OCHOA MERO JAIRO JONAYKER", curso: "10MO EGB", diagnostico: "TRASTORNOS DE HABILIDADES ESCOLARES", tipo: "Permanente", grado: "Grado 2" },
  { nombre: "MENDOZA MERO MAHELY ANALIA", curso: "10MO EGB B", diagnostico: "EN PROCESO", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "CHICA LOPEZ DANNA PAMELA", curso: "1ERO BGU", diagnostico: "TRASTORNOS DE APRENDIZAJE (DISLEXIA Y DISCALCULIA)", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "CEDEÑO BAZURTO ALEXI JAVIER", curso: "3ERO BGU", diagnostico: "DISCAPACIDAD INTELECTUAL LEVE", tipo: "Permanente", grado: "Grado 3" },
  { nombre: "ZAMBRANO ZAMBRANO NAYELI LISBEIDY", curso: "2DO BGU", diagnostico: "TRASTORNOS DE APRENDIZAJE (DISLEXIA Y DISCALCULIA)", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "MERO PARRALES JOSE HERNAN", curso: "2DO BGU", diagnostico: "TRASTORNOS DE APRENDIZAJE (DISLEXIA Y DISCALCULIA)", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "CALISPA ALCIVAR JORGE ALEXANDER", curso: "3ERO BGU", diagnostico: "APRENDIZAJE LENTO", tipo: "Transitoria", grado: "Grado 2" },
  { nombre: "MACIAS VILLAVICENCIO ADRIANO ISAIAS", curso: "", diagnostico: "AUTISMO", tipo: "Permanente", grado: "Grado 2" },
];

const diaVacio = (tiempo = "40") => {
  const t = TIEMPOS_CLASE.find(tc => tc.valor === tiempo) || TIEMPOS_CLASE[1];
  return {
    horaInicio: "", horaFin: "", detalles: "",
    inicio:    { contenido:"", actividades:"", duracion:t.inicio, recursos:"", tecnica:"", instrumento:"" },
    desarrollo:{ contenido:"", actividades:"", duracion:t.desarrollo, recursos:"", tecnica:"", instrumento:"" },
    cierre:    { contenido:"", actividades:"", duracion:t.cierre, recursos:"", tecnica:"", instrumento:"" },
  };
};

const estVacio = () => ({
  id: Date.now() + Math.random(),
  nombre:"", diagnostico:"", tipo:"Transitoria", grado:"Grado 2", asociada:"No asociada a discapacidad",
  nivelCurricular:"Al que pertenece", nivelCurricularDetalle:"",
  diasSel: [], dias: {},
});

const diaEstVacio = (tiempo = "40") => {
  const t = TIEMPOS_CLASE.find(tc => tc.valor === tiempo) || TIEMPOS_CLASE[1];
  return {
    horaInicio:"", horaFin:"", fecha:"",
    inicio:    { contenido:"", actividades:"", duracion:t.inicio, recursos:"", tecnica:"", instrumento:"" },
    desarrollo:{ contenido:"", actividades:"", duracion:t.desarrollo, recursos:"", tecnica:"", instrumento:"" },
    cierre:    { contenido:"", actividades:"", duracion:t.cierre, recursos:"", tecnica:"", instrumento:"" },
  };
};

const descargarArchivo = async (blob, nombre) => {
  // Usar File System Access API (Chrome moderno) para nombre correcto
  if (window.showSaveFilePicker) {
    try {
      const ext = nombre.split('.').pop().toLowerCase();
      const tipos = {
        docx: { description: 'Documento Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } },
        xlsx: { description: 'Hoja de cálculo Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } },
        pdf:  { description: 'Documento PDF', accept: { 'application/pdf': ['.pdf'] } },
      };
      const handle = await window.showSaveFilePicker({
        suggestedName: nombre,
        types: tipos[ext] ? [tipos[ext]] : [],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // Usuario canceló
    }
  }
  // Fallback navegadores sin showSaveFilePicker
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 5000);
};

const descargarDocx = async (doc, nombre) => {
  const blob = await Packer.toBlob(doc);
  await descargarArchivo(blob, nombre);
};

const borde = {
  top:{style:BorderStyle.SINGLE,size:6,color:"000000"},
  bottom:{style:BorderStyle.SINGLE,size:6,color:"000000"},
  left:{style:BorderStyle.SINGLE,size:6,color:"000000"},
  right:{style:BorderStyle.SINGLE,size:6,color:"000000"},
  insideH:{style:BorderStyle.SINGLE,size:6,color:"000000"},
  insideV:{style:BorderStyle.SINGLE,size:6,color:"000000"},
};
const sinBorde = {
  top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},
  left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},
  insideH:{style:BorderStyle.NONE},insideV:{style:BorderStyle.NONE},
};

const celda = (texto, bold=false, bg=null, colspan=1) => new TableCell({
  columnSpan: colspan,
  shading: bg ? {fill:bg} : undefined,
  verticalAlign: VerticalAlign.CENTER,
  children:[new Paragraph({
    alignment: AlignmentType.CENTER,
    children:[new TextRun({text:String(texto||""), bold, size:18, font:"Arial"})]
  })]
});

const celdaIzq = (texto, bold=false, bg=null) => new TableCell({
  shading: bg ? {fill:bg} : undefined,
  children:[new Paragraph({
    children:[new TextRun({text:String(texto||""), bold, size:18, font:"Arial"})]
  })]
});

const getBuffer = async (url) => {
  const r = await fetch(url);
  return await r.arrayBuffer();
};

const thStyle = {padding:"6px 8px",textAlign:"center",border:"1px solid #ccc",fontWeight:600};
const tdStyle = {padding:"4px",border:"1px solid #ddd",minWidth:"90px"};
const inputTabla = {width:"100%",border:"none",background:"transparent",fontSize:"0.82rem",padding:"2px 4px",outline:"none"};

function FormularioUEPA() {
  const [subTab, setSubTab] = useState("plandiario");
  const [cargando, setCargando] = useState(false);

  const [pd, setPd] = useState({
    docente:"LIC. JOSUÉ CRUZ ZAMBRANO",
    asignatura:"", curso:"", semana:"", trimestre:"PRIMER",
    tema:"", tiempo:"40",
    diasSel:[], dias:{},
  });

  const [nee, setNee] = useState({
    docente:"LIC. JOSUÉ CRUZ ZAMBRANO",
    asignatura:"", curso:"", semana:"",
    tema:"", tiempo:"40", fechaLunes:"",
    estudiantes:[],
  });
  const [cargandoNee, setCargandoNee] = useState({});
  const [cargandoTodosNee, setCargandoTodosNee] = useState(false);

  const toggleDia = (dia) => setPd(prev => {
    const sel = prev.diasSel.includes(dia)
      ? prev.diasSel.filter(d=>d!==dia)
      : [...prev.diasSel, dia];
    return {...prev, diasSel:sel, dias:{...prev.dias, [dia]:prev.dias[dia]||diaVacio(prev.tiempo)}};
  });

  const cambiarTiempoPD = (nuevoTiempo) => setPd(prev => {
    const t = TIEMPOS_CLASE.find(tc => tc.valor === nuevoTiempo) || TIEMPOS_CLASE[1];
    const nuevosDias = {...prev.dias};
    Object.keys(nuevosDias).forEach(dia => {
      nuevosDias[dia] = {
        ...nuevosDias[dia],
        inicio: {...nuevosDias[dia].inicio, duracion: t.inicio},
        desarrollo: {...nuevosDias[dia].desarrollo, duracion: t.desarrollo},
        cierre: {...nuevosDias[dia].cierre, duracion: t.cierre},
      };
    });
    return {...prev, tiempo: nuevoTiempo, dias: nuevosDias};
  });

  const updateDiaCampo = (dia, campo, val) => setPd(prev => ({
    ...prev, dias:{...prev.dias, [dia]:{...prev.dias[dia], [campo]:val}}
  }));

  // Autoselección de días y horas según el horario real del docente
  const aplicarAutoseleccionPD = useCallback((curso, materia) => {
    if (!curso || !materia || esMateriaLenguaje(materia)) return;
    const { dias, horas, clases } = autoseleccionar(curso, materia);
    if (dias.length === 0) return;
    setPd(prev => {
      const tiempo = String(getDuracionPorHora(horas[0]));
      const tc = TIEMPOS_CLASE.find(x => x.valor === tiempo) || TIEMPOS_CLASE[1];
      const nuevosDias = {...prev.dias};
      dias.forEach(dia => {
        const hs = clases.filter(c => c.dia === dia).map(c => c.hora).sort((a, b) => a - b);
        const base = nuevosDias[dia] || diaVacio(tiempo);
        nuevosDias[dia] = {
          ...base,
          horaInicio: horaLabel(hs[0]),
          horaFin: hs.length > 1 ? horaLabel(hs[hs.length - 1]) : "",
          inicio: {...base.inicio, duracion: tc.inicio},
          desarrollo: {...base.desarrollo, duracion: tc.desarrollo},
          cierre: {...base.cierre, duracion: tc.cierre},
        };
      });
      return {...prev, tiempo, diasSel: dias, dias: nuevosDias};
    });
  }, []);

  useEffect(() => {
    aplicarAutoseleccionPD(pd.curso, pd.asignatura);
  }, [pd.curso, pd.asignatura, aplicarAutoseleccionPD]);

  const updateFase = (dia, fase, campo, val) => setPd(prev => ({
    ...prev,
    dias:{...prev.dias, [dia]:{...prev.dias[dia], [fase]:{...prev.dias[dia][fase], [campo]:val}}}
  }));

  // Rellena campos vacíos para que ninguna celda quede en blanco
  const rellenarFase = (fase, temaDefault) => {
    const f = fase || {};
    return {
      contenido: f.contenido || temaDefault || "Tema de la clase",
      actividades: f.actividades || "El docente explica el tema con ejemplos, los estudiantes practican ejercicios y resuelven dudas paso a paso.",
      duracion: f.duracion || "10 MIN",
      recursos: f.recursos || "Pizarra, marcadores, cuaderno, libro de texto",
      tecnica: f.tecnica || "Observación directa",
      instrumento: f.instrumento || "Lista de cotejo",
    };
  };

  const sanitizarDia = (diaData, temaDefault) => ({
    ...diaData,
    inicio: rellenarFase(diaData?.inicio, temaDefault),
    desarrollo: rellenarFase(diaData?.desarrollo, temaDefault),
    cierre: rellenarFase(diaData?.cierre, temaDefault),
  });

  const generarIA = async () => {
    if (!pd.asignatura || !pd.curso || pd.diasSel.length===0) {
      alert("Completa asignatura, curso y selecciona al menos un día.");
      return;
    }
    setCargando(true);
    try {
      const resp = await fetch("/.netlify/functions/generate-plan-uepa", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({asignatura:pd.asignatura, curso:pd.curso, semana:pd.semana, tema:pd.tema, tiempo:pd.tiempo, dias:pd.diasSel, detallesPorDia: pd.diasSel.reduce((acc, dia) => { acc[dia] = pd.dias[dia]?.detalles || ""; return acc; }, {})}),
      });
      const raw = await resp.text();
      if (!resp.ok) {
        try { const data = JSON.parse(raw); alert("Error del servidor: " + (data.error || JSON.stringify(data))); } catch { alert("Error del servidor (HTTP " + resp.status + "): la función no respondió correctamente. Verifica que la clave de API esté configurada en Netlify."); }
        return;
      }
      let data;
      try { data = JSON.parse(raw); } catch {
        alert("Error: la función devolvió HTML en vez de JSON. Si estás en localhost:3000, usa 'netlify dev' en vez de 'npm start'.");
        return;
      }
      if (data.dias) {
        setPd(prev => {
          const nd = {...prev.dias};
          prev.diasSel.forEach(dia => { if(data.dias[dia]) nd[dia]={...nd[dia], ...sanitizarDia(data.dias[dia], prev.tema || "Tema de la clase")}; });
          return {...prev, dias:nd};
        });
      }
    } catch(e) {
      alert("Error con la IA: " + e.message);
    } finally { setCargando(false); }
  };

  const addEst = () => setNee(prev => ({...prev, estudiantes:[...prev.estudiantes, estVacio()]}));
  const removeEst = (id) => setNee(prev => ({...prev, estudiantes:prev.estudiantes.filter(e=>e.id!==id)}));

  // Agregar TODOS los estudiantes de un curso del catálogo
  const addEstsPorCurso = (cursoFiltro) => {
    if (!cursoFiltro) { alert("Selecciona un curso primero."); return; }
    const cursoMap = {
      "OCTAVO EGB A": "8VO EGB A", "OCTAVO EGB B": "8VO EGB B",
      "NOVENO EGB A": "9NO EGB A", "NOVENO EGB B": "9NO EGB B",
      "DÉCIMO EGB A": "10MO EGB", "DÉCIMO EGB B": "10MO EGB B",
      "PRIMERO BGU": "1ERO BGU", "SEGUNDO BGU": "2DO BGU", "TERCERO BGU": "3ERO BGU",
    };
    const cursoCorto = cursoMap[cursoFiltro] || cursoFiltro;
    const encontrados = CATALOGO_NEE.filter(e => e.curso === cursoCorto);
    if (encontrados.length === 0) { alert(`No hay estudiantes NEE registrados para ${cursoFiltro}.`); return; }
    setNee(prev => {
      const nombresExistentes = prev.estudiantes.map(e => e.nombre);
      const nuevos = encontrados.filter(e => !nombresExistentes.includes(e.nombre))
        .map(cat => aplicarAutoseleccionEst(
          {...estVacio(), nombre: cat.nombre, diagnostico: cat.diagnostico, tipo: cat.tipo, grado: cat.grado},
          prev.curso, prev.asignatura, prev.fechaLunes
        ));
      if (nuevos.length === 0) { alert("Todos los estudiantes de ese curso ya están agregados."); return prev; }
      return {...prev, estudiantes:[...prev.estudiantes, ...nuevos]};
    });
  };
  const updateEst = (id, campo, val) => setNee(prev => ({
    ...prev, estudiantes:prev.estudiantes.map(e=>e.id===id?{...e,[campo]:val}:e)
  }));

  // Autoselecciona días y horas de un estudiante según curso y materia del horario
  const aplicarAutoseleccionEst = (est, curso, materia, fechaLunes) => {
    if (!est || !curso || !materia || esMateriaLenguaje(materia)) return est;
    const { dias, horas, clases } = autoseleccionar(curso, materia);
    if (dias.length === 0) return est;
    const tiempo = String(getDuracionPorHora(horas[0]));
    const tc = TIEMPOS_CLASE.find(x => x.valor === tiempo) || TIEMPOS_CLASE[1];
    const nuevosDias = {...est.dias};
    dias.forEach(dia => {
      const hs = clases.filter(c => c.dia === dia).map(c => c.hora).sort((a, b) => a - b);
      const base = nuevosDias[dia] || diaEstVacio(tiempo);
      nuevosDias[dia] = {
        ...base,
        horaInicio: horaLabel(hs[0]),
        horaFin: hs.length > 1 ? horaLabel(hs[hs.length - 1]) : "",
        fecha: base.fecha || calcFechaDia(fechaLunes, dia),
        inicio: {...base.inicio, duracion: tc.inicio},
        desarrollo: {...base.desarrollo, duracion: tc.desarrollo},
        cierre: {...base.cierre, duracion: tc.cierre},
      };
    });
    return {...est, diasSel: dias, dias: nuevosDias};
  };

  // Reaplicar autoselección a todos los estudiantes cuando cambia curso/asignatura NEE
  useEffect(() => {
    if (!nee.asignatura || !nee.curso || nee.estudiantes.length === 0) return;
    setNee(prev => ({
      ...prev,
      estudiantes: prev.estudiantes.map(est => aplicarAutoseleccionEst(est, prev.curso, prev.asignatura, prev.fechaLunes)),
    }));
  }, [nee.asignatura, nee.curso]);

  // Calcular fecha automática a partir del lunes
  const calcFechaDia = (fechaLunes, dia) => {
    if (!fechaLunes) return "";
    const monday = new Date(fechaLunes + "T12:00:00");
    const idx = DIAS_SEMANA.indexOf(dia);
    const d = new Date(monday); d.setDate(d.getDate() + idx);
    return d.toISOString().split('T')[0];
  };

  // Cuando cambia la fecha del lunes, recalcular todas las fechas de todos los estudiantes
  const cambiarFechaLunes = (nuevaFecha) => {
    setNee(prev => {
      const nuevosEst = prev.estudiantes.map(est => {
        const nuevosDias = {...est.dias};
        est.diasSel.forEach(dia => {
          if (nuevosDias[dia]) nuevosDias[dia] = {...nuevosDias[dia], fecha: calcFechaDia(nuevaFecha, dia)};
        });
        return {...est, dias: nuevosDias};
      });
      return {...prev, fechaLunes: nuevaFecha, estudiantes: nuevosEst};
    });
  };

  const toggleEstDia = (estId, dia) => setNee(prev => ({
    ...prev, estudiantes: prev.estudiantes.map(e => {
      if (e.id !== estId) return e;
      const sel = e.diasSel.includes(dia) ? e.diasSel.filter(d=>d!==dia) : [...e.diasSel, dia];
      let newDia = e.dias[dia] || diaEstVacio(prev.tiempo);
      if (!e.dias[dia]) newDia = {...newDia, fecha: calcFechaDia(prev.fechaLunes, dia)};
      return {...e, diasSel:sel, dias:{...e.dias, [dia]: newDia}};
    })
  }));

  const updateEstDiaCampo = (estId, dia, campo, val) => setNee(prev => ({
    ...prev, estudiantes: prev.estudiantes.map(e => e.id===estId
      ? {...e, dias:{...e.dias, [dia]:{...e.dias[dia], [campo]:val}}}
      : e)
  }));

  const updateEstDiaFase = (estId, dia, fase, campo, val) => setNee(prev => ({
    ...prev, estudiantes: prev.estudiantes.map(e => e.id===estId
      ? {...e, dias:{...e.dias, [dia]:{...e.dias[dia], [fase]:{...e.dias[dia][fase], [campo]:val}}}}
      : e)
  }));

  const cambiarTiempoNEE = (nuevoTiempo) => setNee(prev => {
    const t = TIEMPOS_CLASE.find(tc => tc.valor === nuevoTiempo) || TIEMPOS_CLASE[1];
    const nuevosEst = prev.estudiantes.map(est => {
      const nuevosDias = {...est.dias};
      Object.keys(nuevosDias).forEach(dia => {
        nuevosDias[dia] = {...nuevosDias[dia],
          inicio:{...nuevosDias[dia].inicio, duracion:t.inicio},
          desarrollo:{...nuevosDias[dia].desarrollo, duracion:t.desarrollo},
          cierre:{...nuevosDias[dia].cierre, duracion:t.cierre},
        };
      });
      return {...est, dias:nuevosDias};
    });
    return {...prev, tiempo: nuevoTiempo, estudiantes: nuevosEst};
  });

  const generarIANee = async (estId) => {
    if (!nee.asignatura || !nee.curso || !nee.tema) {
      alert("Completa asignatura, curso y tema para generar con IA.");
      return;
    }
    const est = nee.estudiantes.find(e => e.id === estId);
    if (!est || est.diasSel.length === 0) { alert("Selecciona al menos un día."); return; }
    setCargandoNee(prev => ({...prev, [estId]: true}));
    try {
      const resp = await fetch("/.netlify/functions/generate-plan-uepa", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          asignatura: nee.asignatura, curso: nee.curso, semana: nee.semana,
          tema: nee.tema, tiempo: nee.tiempo,
          diagnostico: est.diagnostico, tipo: est.tipo, grado: est.grado,
          nombreEstudiante: est.nombre,
          esNEE: true, dias: est.diasSel,
        }),
      });
      const raw = await resp.text();
      if (!resp.ok) {
        try { const data = JSON.parse(raw); alert("Error del servidor: " + (data.error || JSON.stringify(data))); } catch { alert("Error del servidor (HTTP " + resp.status + "): la función no respondió correctamente. Verifica que la clave de API esté configurada en Netlify."); }
        return;
      }
      let data;
      try { data = JSON.parse(raw); } catch {
        alert("Error: la función devolvió HTML en vez de JSON. Si estás en localhost:3000, usa 'netlify dev' en vez de 'npm start'.");
        return;
      }
      if (data.dias) {
        const temas = nee.tema ? nee.tema.split("-").map(t => t.trim()).filter(t => t) : [];
        setNee(prev => ({
          ...prev, estudiantes: prev.estudiantes.map(e => {
            if (e.id !== estId) return e;
            const nd = {...e.dias};
            e.diasSel.forEach((dia, idx) => {
              if(data.dias[dia]) {
                const temaDia = temas[idx] || temas[0] || nee.tema || "Tema de la clase";
                nd[dia]={...nd[dia], ...sanitizarDia(data.dias[dia], temaDia)};
                nd[dia].inicio = {...nd[dia].inicio, contenido: temaDia};
                nd[dia].desarrollo = {...nd[dia].desarrollo, contenido: temaDia};
                nd[dia].cierre = {...nd[dia].cierre, contenido: temaDia};
              }
            });
            return {...e, dias:nd};
          })
        }));
      }
    } catch(err) {
      alert(`Error con la IA para ${est.nombre}: ${err.message}`);
    } finally {
      setCargandoNee(prev => ({...prev, [estId]: false}));
    }
  };

  // Generar IA para TODOS los estudiantes secuencialmente
  const generarIATodosNee = async () => {
    if (!nee.asignatura || !nee.curso || !nee.tema) {
      alert("Completa asignatura, curso y tema antes de generar.");
      return;
    }
    const estConDias = nee.estudiantes.filter(e => e.diasSel.length > 0);
    if (estConDias.length === 0) { alert("Selecciona al menos un día para cada estudiante."); return; }
    setCargandoTodosNee(true);
    let errores = [];
    for (const est of estConDias) {
      setCargandoNee(prev => ({...prev, [est.id]: true}));
      try {
        await generarIANee(est.id);
      } catch(e) { errores.push(est.nombre); }
      // Pausa de 3s entre llamadas para evitar rate-limiting
      await new Promise(r => setTimeout(r, 3000));
    }
    setCargandoTodosNee(false);
    if (errores.length > 0) alert(`Hubo errores con: ${errores.join(", ")}`);
    else alert(`✅ Se generaron las planificaciones para ${estConDias.length} estudiante(s).`);
  };

  const crearHeader = async (titulo) => {
    const logoAm = await getBuffer("/logoamericano.png");
    const logoMin = await getBuffer("/logoministerio.jpg");
    return new Table({
      width:{size:100,type:WidthType.PERCENTAGE}, borders:borde,
      rows:[new TableRow({children:[
        new TableCell({width:{size:15,type:WidthType.PERCENTAGE}, verticalAlign:VerticalAlign.CENTER,
          children:[new Paragraph({alignment:AlignmentType.CENTER,
            children:[new ImageRun({data:logoAm,transformation:{width:70,height:70}})]})]
        }),
        new TableCell({width:{size:70,type:WidthType.PERCENTAGE}, verticalAlign:VerticalAlign.CENTER,
          children:[
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'UNIDAD EDUCATIVA PARTICULAR "AMERICANO"',bold:true,size:22,font:"Arial"})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"AÑO LECTIVO 2026-2027",bold:true,size:20,font:"Arial"})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:titulo,bold:true,size:26,font:"Arial"})]}),
          ]
        }),
        new TableCell({width:{size:15,type:WidthType.PERCENTAGE}, verticalAlign:VerticalAlign.CENTER,
          children:[new Paragraph({alignment:AlignmentType.CENTER,
            children:[new ImageRun({data:logoMin,transformation:{width:90,height:55}})]})]
        }),
      ]})]
    });
  };

  const exportarPlanDiario = async () => {
    try {
      const header = await crearHeader("PLAN DIARIO");
      const children = [header, new Paragraph({text:""})];

      children.push(new Table({
        width:{size:100,type:WidthType.PERCENTAGE}, borders:borde,
        rows:[
          new TableRow({children:[celdaIzq("PROFESOR:",true,"E2EFDA"),celdaIzq(pd.docente)]}),
          new TableRow({children:[celdaIzq("ASIGNATURA:",true,"E2EFDA"),celdaIzq(pd.asignatura)]}),
          new TableRow({children:[celdaIzq("CURSO:",true,"E2EFDA"),celdaIzq(pd.curso)]}),
          new TableRow({children:[celdaIzq("SEMANA:",true,"E2EFDA"),celdaIzq(pd.semana)]}),
          new TableRow({children:[celdaIzq("TRIMESTRE:",true,"E2EFDA"),celdaIzq(`${pd.trimestre} TRIMESTRE`)]}),
        ]
      }));
      children.push(new Paragraph({text:""}));

      const ordenDias = DIAS_SEMANA.filter(d=>pd.diasSel.includes(d));
      for (const dia of ordenDias) {
        const d = pd.dias[dia]; if(!d) continue;
        children.push(new Table({
          width:{size:100,type:WidthType.PERCENTAGE}, borders:borde,
          rows:[
            new TableRow({children:[new TableCell({
              columnSpan:7, shading:{fill:"2D6A2E"},
              children:[new Paragraph({alignment:AlignmentType.CENTER,
                children:[new TextRun({text:`${dia} - HORA: ${d.horaInicio}${d.horaFin ? ' - ' + d.horaFin : ''}`,bold:true,size:20,color:"FFFFFF",font:"Arial"})]})]
            })]}),
            new TableRow({children:[
              new TableCell({rowSpan:2, shading:{fill:"92D050"}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Actividad de clase",bold:true,font:"Arial",size:18})]})]}),
              new TableCell({rowSpan:2, shading:{fill:"92D050"}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Contenidos a desarrollar",bold:true,font:"Arial",size:18})]})]}),
              new TableCell({rowSpan:2, shading:{fill:"92D050"}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Actividades",bold:true,font:"Arial",size:18})]})]}),
              new TableCell({rowSpan:2, shading:{fill:"92D050"}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Duración",bold:true,font:"Arial",size:18})]})]}),
              new TableCell({rowSpan:2, shading:{fill:"92D050"}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Recursos",bold:true,font:"Arial",size:18})]})]}),
              new TableCell({columnSpan:2, shading:{fill:"92D050"}, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Evaluación",bold:true,font:"Arial",size:18})]})]}),
            ]}),
            new TableRow({children:[
              celda("Técnica",true,"92D050"),
              celda("Instrumento",true,"92D050"),
            ]}),
            ...["inicio","desarrollo","cierre"].map(fase=>{
              const faseColor = fase==="inicio"?"FFF2CC":fase==="desarrollo"?"C6EFCE":"A9D08E";
              return new TableRow({children:[
              celda(fase.charAt(0).toUpperCase()+fase.slice(1),true,faseColor),
              celda(d[fase].contenido||""),
              celda(d[fase].actividades||""),
              celda(d[fase].duracion||""),
              celda(d[fase].recursos||""),
              celda(d[fase].tecnica||""),
              celda(d[fase].instrumento||""),
            ]});})
          ]
        }));
        children.push(new Paragraph({text:""}));
      }

      children.push(new Table({
        width:{size:100,type:WidthType.PERCENTAGE}, borders:sinBorde,
        rows:[new TableRow({children:[
          new TableCell({borders:sinBorde,children:[
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"________________________",font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:pd.docente,bold:true,font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"DOCENTE UEPA",font:"Arial",size:16})]}),
          ]}),
          new TableCell({borders:sinBorde,children:[
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"________________________",font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"ARQ. SUÁREZ NAVARRO LUIS FERNANDO",bold:true,font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"RECTOR",font:"Arial",size:16})]}),
          ]}),
          new TableCell({borders:sinBorde,children:[
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"________________________",font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"ING. GERARDO EFRAÍN SALAZAR VILLACÍS",bold:true,font:"Arial",size:18})]}),
            new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"COORDINADOR GENERAL",font:"Arial",size:16})]}),
          ]}),
        ]})]
      }));

      const doc = new Document({sections:[{children}]});
      await descargarDocx(doc, `PlanDiario_${pd.curso}_${pd.semana||"semana"}.docx`);
    } catch(e) { alert("Error al exportar: "+e.message); }
  };

  const exportarNEE = async (est) => {
    try {
      const esG3 = est.grado === "Grado 3";
      const colPri = esG3 ? "1F4E79" : "276749";
      const colSec = esG3 ? "BDD7EE" : "C6F6D5";
      const colLt = esG3 ? "D9E1F2" : "D4EDDA";
      const tiempoMin = nee.tiempo || "40";
      const tb = {top:{style:"thin"},bottom:{style:"thin"},left:{style:"thin"},right:{style:"thin"}};
      const hf = {name:"Arial",size:10,bold:true};
      const nf = {name:"Arial",size:10};

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("NEE");
      ws.columns = [{width:18},{width:20},{width:26},{width:12},{width:16},{width:16},{width:16}];

      // Header
      ws.mergeCells("A1:G1"); ws.getCell("A1").value = "UNIDAD EDUCATIVA PARTICULAR AMERICANO";
      ws.getCell("A1").font = {name:"Arial",size:13,bold:true}; ws.getCell("A1").alignment = {horizontal:"center"};
      ws.mergeCells("A2:G2"); ws.getCell("A2").value = "AÑO LECTIVO 2026-2027";
      ws.getCell("A2").font = {name:"Arial",size:11,bold:true}; ws.getCell("A2").alignment = {horizontal:"center"};
      ws.mergeCells("A3:G3"); ws.getCell("A3").value = "ADAPTACIÓN CURRICULAR";
      ws.getCell("A3").font = {name:"Arial",size:11,bold:true}; ws.getCell("A3").alignment = {horizontal:"center"};

      // Título
      ws.mergeCells("A5:G5");
      const tc = ws.getCell("A5"); tc.value = `PLANIFICACIÓN SEMANAL ${nee.asignatura}`;
      tc.font = {name:"Arial",size:12,bold:true,color:{argb:"FFFFFFFF"}};
      tc.fill = {type:"pattern",pattern:"solid",fgColor:{argb:"FF"+colPri}};
      tc.alignment = {horizontal:"center"}; tc.border = tb;

      let r = 7;
      const setC = (row,col,val,font,fill) => {
        const c = ws.getCell(row,col); c.value = val; c.font = font||nf; c.border = tb;
        c.alignment = {wrapText:true, vertical:"middle"};
        if (fill) c.fill = {type:"pattern",pattern:"solid",fgColor:{argb:"FF"+fill}};
        return c;
      };

      // Datos informativos
      ws.mergeCells(r,1,r,2); setC(r,1,"Nombre de la Institución:",hf,colLt);
      ws.mergeCells(r,3,r,7); setC(r,3,"UNIDAD EDUCATIVA PARTICULAR AMERICANO",nf); r++;
      ws.mergeCells(r,1,r,2); setC(r,1,"Nombre del docente:",hf,colLt);
      ws.mergeCells(r,3,r,7); setC(r,3,nee.docente,nf); r++;
      setC(r,1,"Grado/Curso:",hf,colLt); setC(r,2,nee.curso,nf);
      setC(r,3,"Tiempo de duración:",hf,colLt); setC(r,4,`${tiempoMin} MINUTOS`,nf);
      setC(r,5,"Fecha:",hf,colLt); ws.mergeCells(r,6,r,7); setC(r,6,nee.semana,nf); r+=2;

      // Adaptaciones header
      ws.mergeCells(r,1,r,7); setC(r,1,"ADAPTACIONES CURRICULARES PARA ESTUDIANTES CON NEE:",hf); r++;
      setC(r,1,"NOMBRE DEL ESTUDIANTE",hf,colLt); ws.mergeCells(r,2,r,3);
      setC(r,2,est.nombre,{...nf,bold:true}); setC(r,4,"CURSO",hf,colLt);
      ws.mergeCells(r,5,r,7); setC(r,5,nee.curso,nf); r++;

      const nivelTexto = est.nivelCurricular==="Adaptación curricular" ? `Adaptación curricular: ${est.nivelCurricularDetalle||""}` : "Al que pertenece";
      setC(r,1,"Diagnóstico:",hf,colLt); setC(r,2,est.diagnostico,nf);
      setC(r,3,"Tipo:",hf,colLt); ws.mergeCells(r,4,r,5);
      setC(r,4,`Perm: ${est.tipo==="Permanente"?"X":""}  Trans: ${est.tipo==="Transitoria"?"X":""}`,nf);
      setC(r,6,est.grado,{...nf,bold:true}); setC(r,7,"X",nf); ws.getCell(r,7).alignment={horizontal:"center"}; r++;
      if (esG3) { setC(r,1,"Asociada a discapacidad:",hf,colLt); ws.mergeCells(r,2,r,7); setC(r,2,est.asociada,nf); r++; }
      setC(r,1,"Nivel curricular:",hf,colLt); ws.mergeCells(r,2,r,7); setC(r,2,nivelTexto,{...nf,bold:true});
      r++; r++;

      // Tablas por día
      const ordenDias = DIAS_SEMANA.filter(d => est.diasSel.includes(d));
      for (const dia of ordenDias) {
        const dd = est.dias[dia]; if (!dd) continue;
        const ht = `${dd.horaInicio}${dd.horaFin?" - "+dd.horaFin:""}`;
        ws.mergeCells(r,1,r,7);
        const dc = setC(r,1,`HORA: ${ht}    DÍA: ${dia}    FECHA: ${dd.fecha||""}`,{name:"Arial",size:10,bold:true,color:{argb:"FFFFFFFF"}},colPri);
        dc.alignment = {horizontal:"center"}; r++;
        ["ACTIVIDAD DE CLASE","CONTENIDOS","ACTIVIDADES","DURACIÓN","RECURSOS","Técnica","Instrumento"].forEach((h,i)=>{
          const c = setC(r,i+1,h,{name:"Arial",size:9,bold:true},colSec); c.alignment={horizontal:"center",wrapText:true};
        }); r++;
        for (const fase of ["inicio","desarrollo","cierre"]) {
          const fd = dd[fase]||{};
          setC(r,1,fase.charAt(0).toUpperCase()+fase.slice(1),{name:"Arial",size:9,bold:true},colLt);
          ws.getCell(r,1).alignment={horizontal:"center"};
          [fd.contenido,fd.actividades,fd.duracion,fd.recursos,fd.tecnica,fd.instrumento].forEach((v,i)=>{
            const c = setC(r,i+2,v||"",{name:"Arial",size:9}); c.alignment={wrapText:true};
          }); r++;
        }
        r++;
      }
      r++;

      // Firmas
      const firmas = [["ARQ. FERNANDO SUÁREZ","RECTOR"],["ING. GERARDO SALAZAR","COORDINADOR"],["PSIC. GEMA BAILÓN","DECE"],[nee.docente,"DOCENTE"]];
      const cols = [1,3,5,7];
      cols.forEach((c,i) => { ws.getCell(r,c).value = "________________"; ws.getCell(r,c).alignment = {horizontal:"center"}; });
      r++;
      cols.forEach((c,i) => { ws.getCell(r,c).value = firmas[i][0]; ws.getCell(r,c).font = {name:"Arial",size:8,bold:true}; ws.getCell(r,c).alignment = {horizontal:"center"}; });
      r++;
      cols.forEach((c,i) => { ws.getCell(r,c).value = firmas[i][1]; ws.getCell(r,c).font = {name:"Arial",size:8}; ws.getCell(r,c).alignment = {horizontal:"center"}; });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      await descargarArchivo(blob, `NEE_${est.grado.replace(" ","")}_${est.nombre||"estudiante"}_${nee.curso}.xlsx`);
    } catch(e) { alert("Error al exportar NEE: "+e.message); console.error(e); }
  };

  // ======== PDF EXPORT ========
  const generarHTMLPlanDiario = () => {
    const diasOrden = DIAS_SEMANA.filter(d => pd.diasSel.includes(d));
    let html = `<div style="font-family:Arial,sans-serif;padding:10px;">`;
    // Encabezado institucional con logos
    html += `<table style="width:100%;margin-bottom:8px;"><tr>
      <td style="width:15%;text-align:center;vertical-align:middle;"><img src="${window.location.origin}/logoamericano.png" style="height:70px;"/></td>
      <td style="text-align:center;vertical-align:middle;">
        <div style="font-size:16px;font-weight:bold;">UNIDAD EDUCATIVA PARTICULAR "AMERICANO"</div>
        <div style="font-size:12px;">AÑO LECTIVO 2026-2027</div>
      </td>
      <td style="width:15%;text-align:center;vertical-align:middle;"><img src="${window.location.origin}/logoministerio.jpg" style="height:60px;"/></td>
    </tr></table>`;
    html += `<h3 style="text-align:center;color:#1F4E79;margin:4px 0 8px;">PLAN DIARIO</h3>`;
    html += `<table style="width:60%;margin:0 auto 10px;border-collapse:collapse;border:2px solid #000;">
      <tr><td style="border:1px solid #000;font-weight:bold;font-style:italic;padding:5px;width:35%;">PROFESOR:</td><td style="border:1px solid #000;padding:5px;">${pd.docente}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;font-style:italic;padding:5px;">ASIGNATURA:</td><td style="border:1px solid #000;padding:5px;">${pd.asignatura}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;font-style:italic;padding:5px;">CURSO:</td><td style="border:1px solid #000;padding:5px;">${pd.curso}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;font-style:italic;padding:5px;">SEMANA:</td><td style="border:1px solid #000;padding:5px;">${pd.semana}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;font-style:italic;padding:5px;">TRIMESTRE:</td><td style="border:1px solid #000;padding:5px;">${pd.trimestre} TRIMESTRE</td></tr>
    </table>`;
    for (const dia of diasOrden) {
      const dd = pd.dias[dia]; if (!dd) continue;
      const ht = `${dd.horaInicio||''}${dd.horaFin?' - '+dd.horaFin:''}`;
      html += `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
        <tr><td colspan="7" style="background:#2d6a2e;color:white;font-weight:bold;text-align:center;padding:6px;border:1px solid #000;">${dia} - HORA: ${ht}</td></tr>
        <tr style="background:#92D050;">
          <td rowspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;vertical-align:middle;">Actividad</td>
          <td rowspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;vertical-align:middle;">Contenidos a desarrollar</td>
          <td rowspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;vertical-align:middle;">Actividades</td>
          <td rowspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;vertical-align:middle;">Duración</td>
          <td rowspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;vertical-align:middle;">Recursos</td>
          <td colspan="2" style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;">Evaluación</td>
        </tr>
        <tr style="background:#92D050;">
          <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;">Técnica</td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;">Instrumento</td>
        </tr>`;
      for (const fase of ['inicio','desarrollo','cierre']) {
        const fd = dd[fase]||{};
        const faseColor = fase==='inicio'?'#FFF2CC':fase==='desarrollo'?'#C6EFCE':'#A9D08E';
        html += `<tr>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;background:${faseColor};text-transform:capitalize;">${fase}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.contenido||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.actividades||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;text-align:center;">${fd.duracion||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.recursos||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.tecnica||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.instrumento||''}</td>
        </tr>`;
      }
      html += `</table>`;
    }
    // Firmas
    html += `<table style="width:100%;margin-top:30px;"><tr>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">${pd.docente}</div><div style="font-size:10px;">DOCENTE UEPA</div></td>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">ARQ. SUÁREZ NAVARRO LUIS FERNANDO</div><div style="font-size:10px;">RECTOR</div></td>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">ING. GERARDO EFRAÍN SALAZAR VILLACÍS</div><div style="font-size:10px;">COORDINADOR GENERAL</div></td>
    </tr></table>`;
    html += `</div>`;
    return html;
  };

  const generarHTMLNee = (est) => {
    const esG3 = est.grado === 'Grado 3';
    const colPri = esG3 ? '#1F4E79' : '#276749';
    const colSec = esG3 ? '#BDD7EE' : '#C6F6D5';
    const colLt = esG3 ? '#D9E1F2' : '#D4EDDA';
    const tiempoMin = nee.tiempo || '40';
    let html = `<div style="font-family:Arial,sans-serif;padding:10px;">`;
    html += `<table style="width:100%;margin-bottom:4px;"><tr>
      <td style="width:15%;text-align:center;vertical-align:middle;"><img src="${window.location.origin}/logoamericano.png" style="height:70px;"/></td>
      <td style="text-align:center;vertical-align:middle;">
        <div style="font-size:16px;font-weight:bold;">UNIDAD EDUCATIVA PARTICULAR AMERICANO</div>
        <div style="font-size:12px;">AÑO LECTIVO 2026-2027</div>
        <div style="font-size:13px;font-weight:bold;">ADAPTACIÓN CURRICULAR</div>
      </td>
      <td style="width:15%;text-align:center;vertical-align:middle;"><img src="${window.location.origin}/logoministerio.jpg" style="height:60px;"/></td>
    </tr></table>`;
    html += `<div style="background:${colPri};color:white;text-align:center;padding:6px;font-weight:bold;margin:8px 0;border:1px solid #000;">PLANIFICACIÓN SEMANAL ${nee.asignatura}</div>`;
    html += `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Institución:</td><td colspan="5" style="border:1px solid #000;padding:4px;">UNIDAD EDUCATIVA PARTICULAR AMERICANO</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Docente:</td><td colspan="5" style="border:1px solid #000;padding:4px;">${nee.docente}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Curso:</td><td style="border:1px solid #000;padding:4px;">${nee.curso}</td><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Tiempo:</td><td style="border:1px solid #000;padding:4px;">${tiempoMin} MIN</td><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Fecha:</td><td style="border:1px solid #000;padding:4px;">${nee.semana}</td></tr>
    </table>`;
    const nivelTexto = est.nivelCurricular==='Adaptación curricular' ? `Adaptación curricular: ${est.nivelCurricularDetalle||''}` : 'Al que pertenece';
    html += `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">ESTUDIANTE</td><td colspan="2" style="border:1px solid #000;padding:4px;font-weight:bold;">${est.nombre}</td><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">CURSO</td><td colspan="2" style="border:1px solid #000;padding:4px;">${nee.curso}</td></tr>
      <tr><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Diagnóstico:</td><td style="border:1px solid #000;padding:4px;">${est.diagnostico}</td><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Tipo:</td><td style="border:1px solid #000;padding:4px;">${est.tipo}</td><td style="border:1px solid #000;padding:4px;font-weight:bold;">${est.grado}</td><td style="border:1px solid #000;font-weight:bold;padding:4px;background:${colLt};">Nivel curricular</td></tr>
      <tr><td colspan="6" style="border:1px solid #000;padding:4px;font-weight:bold;">${nivelTexto}</td></tr>
    </table>`;
    const ordenDias = DIAS_SEMANA.filter(d => est.diasSel.includes(d));
    for (const dia of ordenDias) {
      const dd = est.dias[dia]; if (!dd) continue;
      const ht = `${dd.horaInicio||''}${dd.horaFin?' - '+dd.horaFin:''}`;
      html += `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <tr><td colspan="7" style="background:${colPri};color:white;font-weight:bold;text-align:center;padding:6px;border:1px solid #000;">HORA: ${ht} — DÍA: ${dia} — FECHA: ${dd.fecha||''}</td></tr>
        <tr style="background:${colSec};">${['Actividad','Contenidos','Actividades','Duración','Recursos','Técnica','Instrumento'].map(h=>`<td style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;font-size:11px;">${h}</td>`).join('')}</tr>`;
      for (const fase of ['inicio','desarrollo','cierre']) {
        const fd = dd[fase]||{};
        html += `<tr>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:4px;background:${colLt};text-transform:capitalize;">${fase}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.contenido||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.actividades||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;text-align:center;">${fd.duracion||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.recursos||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.tecnica||''}</td>
          <td style="border:1px solid #000;padding:4px;font-size:10px;">${fd.instrumento||''}</td>
        </tr>`;
      }
      html += `</table>`;
    }
    // Firmas
    html += `<table style="width:100%;margin-top:30px;"><tr>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">${nee.docente}</div><div style="font-size:10px;">DOCENTE UEPA</div></td>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">ARQ. SUÁREZ NAVARRO LUIS FERNANDO</div><div style="font-size:10px;">RECTOR</div></td>
      <td style="text-align:center;width:33%;padding:10px;"><div>________________________</div><div style="font-weight:bold;font-size:11px;">ING. GERARDO EFRAÍN SALAZAR VILLACÍS</div><div style="font-size:10px;">COORDINADOR GENERAL</div></td>
    </tr></table>`;
    html += `</div>`;
    return html;
  };

  const exportarPDF = (htmlContent, nombre) => {
    const ventana = window.open('', '_blank', 'width=1200,height=800');
    ventana.document.write(`<!DOCTYPE html>
<html><head><title>${nombre}</title>
<style>
  @media print { @page { size: landscape; margin: 8mm; } }
  body { font-family: Arial, sans-serif; margin: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
  td, th { border: 1px solid #000; padding: 5px; font-size: 11px; }
  h2, h5 { margin: 4px 0; }
</style>
</head><body>${htmlContent}
<script>
  window.onload = function() { 
    setTimeout(function() { window.print(); }, 400); 
  };
<\/script>
</body></html>`);
    ventana.document.close();
  };

  const exportarPDFPlanDiario = () => {
    const html = generarHTMLPlanDiario();
    exportarPDF(html, `PlanDiario_${pd.curso}_${pd.semana||'semana'}.pdf`);
  };

  const exportarPDFNee = (est) => {
    const html = generarHTMLNee(est);
    exportarPDF(html, `NEE_${est.grado.replace(' ','')}_${est.nombre||'estudiante'}_${nee.curso}.pdf`);
  };

  return (
    <div>
      <div style={{display:"flex",borderBottom:"2px solid #e2e8f0",marginBottom:"1.5rem"}}>
        {[["plandiario","📅 Plan Diario","#2b6cb0"],["nee","♿ NEE","#c53030"]].map(([key,label,color])=>(
          <button key={key} onClick={()=>setSubTab(key)} style={{
            padding:"0.6rem 1.5rem",border:"none",cursor:"pointer",fontWeight:600,fontSize:"0.9rem",
            background:subTab===key?"white":"#f7fafc",
            color:subTab===key?color:"#718096",
            borderBottom:subTab===key?`3px solid ${color}`:"3px solid transparent",
          }}>{label}</button>
        ))}
      </div>

      {subTab==="plandiario" && (
        <div>
          <h2 style={{color:"#1a365d",marginBottom:"1.5rem",fontSize:"1.1rem",borderBottom:"2px solid #e2e8f0",paddingBottom:"0.75rem"}}>
            Plan Diario — Formato UEPA
          </h2>
          <div className="fila-dos">
            <div className="campo"><label>👤 Nombre del docente</label>
              <input value={pd.docente} onChange={e=>setPd(p=>({...p,docente:e.target.value}))} placeholder="Ej: LIC. JOSUÉ CRUZ ZAMBRANO"/>
            </div>
            <div className="campo"><label>Asignatura</label>
              <select value={pd.asignatura} onChange={e=>setPd(p=>({...p,asignatura:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {ASIGNATURAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-dos">
            <div className="campo"><label>Curso</label>
              <select value={pd.curso} onChange={e=>setPd(p=>({...p,curso:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {CURSOS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-tres">
            <div className="campo"><label>Semana (ej: DEL 2 AL 6 DE JUNIO)</label>
              <input value={pd.semana} onChange={e=>setPd(p=>({...p,semana:e.target.value}))} placeholder="DEL ... AL ..."/>
            </div>
            <div className="campo"><label>Trimestre</label>
              <select value={pd.trimestre} onChange={e=>setPd(p=>({...p,trimestre:e.target.value}))}>
                {TRIMESTRES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="campo"><label>⏱ Tiempo de clase</label>
              <select value={pd.tiempo} onChange={e=>cambiarTiempoPD(e.target.value)}>
                {TIEMPOS_CLASE.map(t=><option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="campo" style={{marginBottom:"0.75rem"}}>
            <label>📝 Temas de la semana <span style={{fontSize:"0.75rem",color:"#718096",fontWeight:400}}>(sepáralos con guión "-" para distribuir por día)</span></label>
            <input value={pd.tema} onChange={e=>setPd(p=>({...p,tema:e.target.value}))} placeholder="Ej: Ecuaciones lineales - Sistemas de ecuaciones - Desigualdades" style={{width:"100%"}}/>
          </div>
          <div className="campo" style={{marginBottom:"1.5rem"}}>
            <label>Días de clase esta semana</label>
            <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginTop:"0.5rem"}}>
              {DIAS_SEMANA.map(dia=>(
                <label key={dia} style={{display:"flex",alignItems:"center",gap:"0.4rem",cursor:"pointer",
                  padding:"0.5rem 1rem",borderRadius:"8px",fontWeight:pd.diasSel.includes(dia)?600:400,
                  background:pd.diasSel.includes(dia)?"#ebf8ff":"#f7fafc",
                  border:`1.5px solid ${pd.diasSel.includes(dia)?"#3182ce":"#e2e8f0"}`}}>
                  <input type="checkbox" checked={pd.diasSel.includes(dia)} onChange={()=>toggleDia(dia)} style={{accentColor:"#3182ce"}}/>
                  {dia}
                </label>
              ))}
            </div>
            {pd.curso && pd.asignatura && !esMateriaLenguaje(pd.asignatura) && (
              <p style={{fontSize:"0.75rem",color:"#2b6cb0",marginTop:"0.5rem"}}>
                ✅ Días y horas autoseleccionados según tu horario real (puedes modificarlos manualmente)
              </p>
            )}
            {pd.curso && pd.asignatura && esMateriaLenguaje(pd.asignatura) && (
              <p style={{fontSize:"0.75rem",color:"#718096",marginTop:"0.5rem"}}>
                ℹ️ Lenguaje no está en el horario automático: selecciona días y horas manualmente
              </p>
            )}
          </div>

          {DIAS_SEMANA.filter(d=>pd.diasSel.includes(d)).map(dia=>(
            <div key={dia} style={{background:"#f7fafc",borderRadius:"10px",padding:"1rem",marginBottom:"1rem",border:"1.5px solid #e2e8f0"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
                <h3 style={{color:"#1a365d",fontSize:"0.95rem"}}>📅 {dia}</h3>
                <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                  <span style={{fontSize:"0.82rem",fontWeight:600,color:"#4a5568"}}>Hora:</span>
                  <select value={pd.dias[dia]?.horaInicio||""} onChange={e=>updateDiaCampo(dia,"horaInicio",e.target.value)}
                    style={{padding:"0.35rem",border:"1.5px solid #e2e8f0",borderRadius:"6px",fontSize:"0.85rem"}}>
                    <option value="">--</option>
                    {HORAS_CLASE.map(h=><option key={h}>{h}</option>)}
                  </select>
                  <span style={{fontWeight:600}}>—</span>
                  <select value={pd.dias[dia]?.horaFin||""} onChange={e=>updateDiaCampo(dia,"horaFin",e.target.value)}
                    style={{padding:"0.35rem",border:"1.5px solid #e2e8f0",borderRadius:"6px",fontSize:"0.85rem"}}>
                    <option value="">--</option>
                    {HORAS_CLASE.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:"0.75rem"}}>
                <label style={{fontSize:"0.82rem",fontWeight:600,color:"#4a5568",display:"block",marginBottom:"0.3rem"}}>📋 Detalles de la clase <span style={{fontWeight:400,color:"#a0aec0"}}>(describe qué harás: explicación, ejercicios, página del libro, etc.)</span></label>
                <textarea value={pd.dias[dia]?.detalles||""} onChange={e=>updateDiaCampo(dia,"detalles",e.target.value)}
                  placeholder="Ej: Se explicará la definición del plano cartesiano, se realizarán ejercicios de ubicación de puntos y se trabajará en la página 18 del libro."
                  style={{width:"100%",minHeight:"60px",border:"1.5px solid #e2e8f0",borderRadius:"8px",padding:"0.5rem",fontSize:"0.85rem",resize:"vertical",fontFamily:"inherit",background:"white"}}/>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem"}}>
                  <thead>
                    <tr style={{background:"#2d6a2e",color:"white"}}>
                      {["Actividad","Contenidos","Actividades","Duración","Recursos"].map(h=>(
                        <th key={h} style={{...thStyle,verticalAlign:"middle"}} rowSpan={2}>{h}</th>
                      ))}
                      <th style={thStyle} colSpan={2}>Evaluación</th>
                    </tr>
                    <tr style={{background:"#2d6a2e",color:"white"}}>
                      <th style={thStyle}>Técnica</th>
                      <th style={thStyle}>Instrumento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["inicio","desarrollo","cierre"].map(fase=>{
                      const faseColor = fase==="inicio"?"#FFF2CC":fase==="desarrollo"?"#C6EFCE":"#A9D08E";
                      return (
                      <tr key={fase}>
                        <td style={{...tdStyle,background:faseColor,fontWeight:700,textAlign:"center",textTransform:"capitalize"}}>{fase}</td>
                        {["contenido","actividades","duracion","recursos","tecnica","instrumento"].map(campo=>(
                          <td key={campo} style={tdStyle}>
                            <input value={pd.dias[dia]?.[fase]?.[campo]||""} onChange={e=>updateFase(dia,fase,campo,e.target.value)} style={inputTabla}/>
                          </td>
                        ))}
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div style={{display:"flex",gap:"1rem",marginTop:"1rem"}}>
            <button className="boton-generar" style={{background:"#276749"}}
              onClick={generarIA} disabled={!pd.asignatura||!pd.curso||pd.diasSel.length===0||cargando}>
              {cargando?"Generando...":"✨ Generar con IA"}
            </button>
            <button className="boton-generar"
              onClick={exportarPlanDiario} disabled={!pd.asignatura||!pd.curso||pd.diasSel.length===0}>
              📄 Descargar Word
            </button>
            <button className="boton-generar" style={{background:"#c53030"}}
              onClick={exportarPDFPlanDiario} disabled={!pd.asignatura||!pd.curso||pd.diasSel.length===0}>
              📕 Descargar PDF
            </button>
          </div>
        </div>
      )}

      {subTab==="nee" && (
        <div>
          <h2 style={{color:"#c53030",marginBottom:"1.5rem",fontSize:"1.1rem",borderBottom:"2px solid #e2e8f0",paddingBottom:"0.75rem"}}>
            Adaptación Curricular — NEE
          </h2>
          <div className="fila-dos">
            <div className="campo"><label>👤 Nombre del docente</label>
              <input value={nee.docente} onChange={e=>setNee(p=>({...p,docente:e.target.value}))} placeholder="Ej: LIC. JOSUÉ CRUZ ZAMBRANO"/>
            </div>
            <div className="campo"><label>Asignatura</label>
              <select value={nee.asignatura} onChange={e=>setNee(p=>({...p,asignatura:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {ASIGNATURAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-dos">
            <div className="campo"><label>Curso</label>
              <select value={nee.curso} onChange={e=>setNee(p=>({...p,curso:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {CURSOS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-tres">
            <div className="campo"><label>Semana / Fecha</label>
              <input value={nee.semana} onChange={e=>setNee(p=>({...p,semana:e.target.value}))} placeholder="Semana del ... al ..."/>
            </div>
            <div className="campo"><label>📝 Temas de la semana <span style={{fontSize:"0.75rem",color:"#718096",fontWeight:400}}>(sepáralos con guión "-" por día)</span></label>
              <input value={nee.tema} onChange={e=>setNee(p=>({...p,tema:e.target.value}))} placeholder="Ej: Logaritmos - Propiedades - Ecuaciones logarítmicas"/>
            </div>
            <div className="campo"><label>⏱ Tiempo de clase</label>
              <select value={nee.tiempo} onChange={e=>cambiarTiempoNEE(e.target.value)}>
                {TIEMPOS_CLASE.map(t=><option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-dos" style={{marginTop:"0.5rem"}}>
            <div className="campo"><label>📅 Fecha del LUNES <span style={{fontSize:"0.75rem",color:"#718096",fontWeight:400}}>(las fechas de cada día se calculan automáticamente)</span></label>
              <input type="date" value={nee.fechaLunes} onChange={e=>cambiarFechaLunes(e.target.value)} style={{padding:"0.5rem",border:"1.5px solid #e2e8f0",borderRadius:"8px",fontSize:"0.85rem"}}/>
              {nee.fechaLunes && <span style={{fontSize:"0.75rem",color:"#276749",marginTop:"0.25rem",display:"block"}}>✅ Fechas auto: Lun {calcFechaDia(nee.fechaLunes,"LUNES")} → Vie {calcFechaDia(nee.fechaLunes,"VIERNES")}</span>}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"1rem 0",gap:"0.75rem",flexWrap:"wrap"}}>
            <h3 style={{color:"#1a365d",fontSize:"1rem"}}>Estudiantes con NEE</h3>
            <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
              <select id="catalogo-nee-select" style={{padding:"0.5rem",border:"1.5px solid #e2e8f0",borderRadius:"8px",fontSize:"0.85rem",minWidth:"260px"}}>
                <option value="">— Seleccionar estudiante registrado —</option>
                {CATALOGO_NEE.map((e,i)=><option key={i} value={i}>{e.nombre} ({e.curso || "Sin curso"}) — {e.diagnostico}</option>)}
              </select>
              <button onClick={()=>{
                const sel = document.getElementById("catalogo-nee-select");
                const idx = sel.value;
                if (idx === "") { alert("Selecciona un estudiante de la lista."); return; }
                const cat = CATALOGO_NEE[parseInt(idx)];
                const nuevo = { ...estVacio(), nombre: cat.nombre, diagnostico: cat.diagnostico, tipo: cat.tipo, grado: cat.grado };
                setNee(prev => ({...prev, estudiantes:[...prev.estudiantes, aplicarAutoseleccionEst(nuevo, prev.curso, prev.asignatura, prev.fechaLunes)]}));
                sel.value = "";
              }} style={{padding:"0.5rem 1rem",background:"#276749",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                ✚ Agregar seleccionado
              </button>
              <button onClick={()=>addEstsPorCurso(nee.curso)}
                style={{padding:"0.5rem 1rem",background:"#2b6cb0",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}
                disabled={!nee.curso}>
                👥 Agregar TODOS del curso
              </button>
              <button onClick={addEst} style={{padding:"0.5rem 1rem",background:"#c53030",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                + Agregar manual
              </button>
            </div>
          </div>

          {nee.estudiantes.length===0&&(
            <div style={{textAlign:"center",color:"#718096",padding:"2rem",background:"#f7fafc",borderRadius:"8px",border:"1.5px dashed #e2e8f0"}}>
              Selecciona un estudiante de la lista o haz clic en "+ Agregar manual" para comenzar
            </div>
          )}

          {nee.estudiantes.map((est,idx)=>{
            const cardColor = est.grado==="Grado 3" ? {bg:"#ebf8ff",border:"#bee3f8",accent:"#2b6cb0"} : {bg:"#f0fff4",border:"#c6f6d5",accent:"#276749"};
            return (
            <div key={est.id} style={{background:cardColor.bg,border:`1.5px solid ${cardColor.border}`,borderRadius:"10px",padding:"1.25rem",marginBottom:"1.5rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <h4 style={{color:cardColor.accent}}>Estudiante {idx+1} — {est.grado}</h4>
                <button onClick={()=>removeEst(est.id)} style={{background:"none",border:"none",color:"#c53030",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
              </div>
              <div className="fila-dos">
                <div className="campo"><label>Nombre completo</label>
                  <input value={est.nombre} onChange={e=>updateEst(est.id,"nombre",e.target.value)} placeholder="Apellidos y nombres"/>
                </div>
                <div className="campo"><label>Diagnóstico</label>
                  <input value={est.diagnostico} onChange={e=>updateEst(est.id,"diagnostico",e.target.value)} placeholder="Ej: TDAH, Autismo..."/>
                </div>
              </div>
              <div className="fila-tres" style={{marginTop:"0.75rem"}}>
                <div className="campo"><label>Tipo de adaptación</label>
                  <select value={est.tipo} onChange={e=>updateEst(est.id,"tipo",e.target.value)}>
                    <option>Permanente</option><option>Transitoria</option>
                  </select>
                </div>
                <div className="campo"><label>Grado AC</label>
                  <select value={est.grado} onChange={e=>updateEst(est.id,"grado",e.target.value)}>
                    <option>Grado 2</option><option>Grado 3</option>
                  </select>
                </div>
                {est.grado==="Grado 3"&&(
                  <div className="campo"><label>Asociada a discapacidad</label>
                    <select value={est.asociada} onChange={e=>updateEst(est.id,"asociada",e.target.value)}>
                      <option>Asociada a discapacidad</option>
                      <option>No asociada a discapacidad</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="fila-tres" style={{marginTop:"0.5rem"}}>
                <div className="campo"><label>Nivel curricular</label>
                  <select value={est.nivelCurricular||"Al que pertenece"} onChange={e=>updateEst(est.id,"nivelCurricular",e.target.value)}>
                    <option>Al que pertenece</option>
                    <option>Adaptación curricular</option>
                  </select>
                </div>
                {est.nivelCurricular==="Adaptación curricular"&&(
                  <div className="campo"><label>Nivel de adaptación</label>
                    <input value={est.nivelCurricularDetalle||""} onChange={e=>updateEst(est.id,"nivelCurricularDetalle",e.target.value)} placeholder="Ej: 7MO EGB"/>
                  </div>
                )}
              </div>

              {/* Selector de días */}
              <div className="campo" style={{marginTop:"1rem"}}>
                <label>📅 Días de clase esta semana</label>
                <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap",marginTop:"0.4rem"}}>
                  {DIAS_SEMANA.map(dia=>(
                    <label key={dia} style={{display:"flex",alignItems:"center",gap:"0.3rem",cursor:"pointer",
                      padding:"0.4rem 0.8rem",borderRadius:"8px",fontWeight:est.diasSel.includes(dia)?600:400,fontSize:"0.85rem",
                      background:est.diasSel.includes(dia)?cardColor.bg:"#f7fafc",
                      border:`1.5px solid ${est.diasSel.includes(dia)?cardColor.accent:"#e2e8f0"}`}}>
                      <input type="checkbox" checked={est.diasSel.includes(dia)} onChange={()=>toggleEstDia(est.id,dia)} style={{accentColor:cardColor.accent}}/>
                      {dia}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tabla por cada día seleccionado */}
              {DIAS_SEMANA.filter(d=>est.diasSel.includes(d)).map(dia=>{
                const dd = est.dias[dia]; if(!dd) return null;
                return (
                  <div key={dia} style={{background:"white",borderRadius:"8px",padding:"0.75rem",marginTop:"0.75rem",border:`1px solid ${cardColor.border}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                      <h5 style={{color:cardColor.accent,fontSize:"0.9rem"}}>📅 {dia}</h5>
                      <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                        <span style={{fontSize:"0.8rem",fontWeight:600}}>Hora:</span>
                        <select value={dd.horaInicio||""} onChange={e=>updateEstDiaCampo(est.id,dia,"horaInicio",e.target.value)}
                          style={{padding:"0.3rem",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.82rem"}}>
                          <option value="">--</option>
                          {HORAS_CLASE.map(h=><option key={h}>{h}</option>)}
                        </select>
                        <span>—</span>
                        <select value={dd.horaFin||""} onChange={e=>updateEstDiaCampo(est.id,dia,"horaFin",e.target.value)}
                          style={{padding:"0.3rem",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.82rem"}}>
                          <option value="">--</option>
                          {HORAS_CLASE.map(h=><option key={h}>{h}</option>)}
                        </select>
                        <span style={{fontSize:"0.8rem",fontWeight:600,marginLeft:"0.5rem"}}>Fecha:</span>
                        <input type="date" value={dd.fecha||""} onChange={e=>updateEstDiaCampo(est.id,dia,"fecha",e.target.value)}
                          style={{padding:"0.3rem",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.82rem"}}/>
                      </div>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem"}}>
                      <thead>
                        <tr style={{background:cardColor.accent,color:"white"}}>
                          {["Actividad","Contenidos","Actividades","Duración","Recursos","Técnica","Instrumento"].map(h=>(
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["inicio","desarrollo","cierre"].map(fase=>(
                          <tr key={fase}>
                            <td style={{...tdStyle,background:cardColor.bg,fontWeight:700,textAlign:"center",textTransform:"capitalize"}}>{fase}</td>
                            {["contenido","actividades","duracion","recursos","tecnica","instrumento"].map(campo=>(
                              <td key={campo} style={tdStyle}>
                                <input value={dd[fase]?.[campo]||""} onChange={e=>updateEstDiaFase(est.id,dia,fase,campo,e.target.value)} style={inputTabla}/>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              <div style={{display:"flex",gap:"0.75rem",marginTop:"1rem"}}>
                <button onClick={()=>generarIANee(est.id)}
                  style={{flex:1,padding:"0.7rem",background:"#276749",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600}}
                  disabled={!nee.asignatura||!nee.curso||!nee.tema||est.diasSel.length===0||cargandoNee[est.id]||cargandoTodosNee}>
                  {cargandoNee[est.id]?"⏳ Generando...":"✨ Generar con IA"}
                </button>
                <button onClick={()=>exportarNEE(est)}
                  style={{flex:1,padding:"0.7rem",background:cardColor.accent,color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600}}
                  disabled={!est.nombre||!nee.asignatura||est.diasSel.length===0}>
                  📊 Excel — {est.grado}
                </button>
                <button onClick={()=>exportarPDFNee(est)}
                  style={{flex:1,padding:"0.7rem",background:"#c53030",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600}}
                  disabled={!est.nombre||!nee.asignatura||est.diasSel.length===0}>
                  📕 PDF — {est.nombre ? est.nombre.split(" ").slice(-1)[0] : est.grado}
                </button>
              </div>
            </div>
          )})}

          {/* Botón global: Generar TODOS con IA */}
          {nee.estudiantes.length > 0 && (
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.5rem",padding:"1rem",background:"#f0fff4",borderRadius:"10px",border:"2px solid #276749"}}>
              <button onClick={generarIATodosNee}
                style={{flex:1,padding:"0.85rem",background:"linear-gradient(135deg,#276749,#2b6cb0)",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:"1rem",letterSpacing:"0.5px"}}
                disabled={!nee.asignatura||!nee.curso||!nee.tema||cargandoTodosNee||nee.estudiantes.every(e=>e.diasSel.length===0)}>
                {cargandoTodosNee ? `⏳ Generando para ${nee.estudiantes.filter(e=>e.diasSel.length>0).length} estudiantes...` : `🚀 Generar IA para TODOS (${nee.estudiantes.filter(e=>e.diasSel.length>0).length} estudiantes)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormularioUEPA;
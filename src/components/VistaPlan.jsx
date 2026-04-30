import React from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

function VistaPlan({ planificacion: p }) {
  const { datosInformativos: d, metodologia: m } = p;

  const exportarWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "PLANIFICACIÓN MICROCURRICULAR",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Ministerio de Educación del Ecuador",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "DATOS INFORMATIVOS", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: "Institución: ", bold: true }), new TextRun(d.institucion)] }),
          new Paragraph({ children: [new TextRun({ text: "Docente: ", bold: true }), new TextRun(d.docente)] }),
          new Paragraph({ children: [new TextRun({ text: "Área: ", bold: true }), new TextRun(d.area)] }),
          new Paragraph({ children: [new TextRun({ text: "Grado: ", bold: true }), new TextRun(d.grado)] }),
          new Paragraph({ children: [new TextRun({ text: "Fecha: ", bold: true }), new TextRun(d.fecha)] }),
          new Paragraph({ children: [new TextRun({ text: "Tiempo: ", bold: true }), new TextRun(d.tiempo)] }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "OBJETIVO DE APRENDIZAJE", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: p.objetivoAprendizaje }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "DESTREZAS CON CRITERIO DE DESEMPEÑO", heading: HeadingLevel.HEADING_2 }),
          ...p.destrezas.map(dest => new Paragraph({
            children: [new TextRun({ text: `${dest.codigo}: `, bold: true }), new TextRun(dest.descripcion)]
          })),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "EJES TRANSVERSALES", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: p.ejesTransversales }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "METODOLOGÍA", heading: HeadingLevel.HEADING_2 }),

          new Paragraph({ text: `ANTICIPACIÓN (${m.anticipacion.duracion})`, heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: "Estrategia: ", bold: true }), new TextRun(m.anticipacion.estrategia)] }),
          ...m.anticipacion.actividades.map(a => new Paragraph({ text: `• ${a}` })),
          new Paragraph({ text: "" }),

          new Paragraph({ text: `CONSTRUCCIÓN (${m.construccion.duracion})`, heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: "Estrategia: ", bold: true }), new TextRun(m.construccion.estrategia)] }),
          ...m.construccion.actividades.map(a => new Paragraph({ text: `• ${a}` })),
          new Paragraph({ text: "" }),

          new Paragraph({ text: `CONSOLIDACIÓN (${m.consolidacion.duracion})`, heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: "Estrategia: ", bold: true }), new TextRun(m.consolidacion.estrategia)] }),
          ...m.consolidacion.actividades.map(a => new Paragraph({ text: `• ${a}` })),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "DISEÑO UNIVERSAL PARA EL APRENDIZAJE (DUA)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: "Representación: ", bold: true }), new TextRun(p.dua.representacion)] }),
          new Paragraph({ children: [new TextRun({ text: "Acción y expresión: ", bold: true }), new TextRun(p.dua.accionExpresion)] }),
          new Paragraph({ children: [new TextRun({ text: "Motivación: ", bold: true }), new TextRun(p.dua.motivacion)] }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "EVALUACIÓN", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: "Técnicas: ", bold: true }), new TextRun(p.evaluacion.tecnicas.join(", "))] }),
          new Paragraph({ children: [new TextRun({ text: "Instrumentos: ", bold: true }), new TextRun(p.evaluacion.instrumentos.join(", "))] }),
          new Paragraph({ children: [new TextRun({ text: "Criterios: ", bold: true }), new TextRun(p.evaluacion.criterios.join(", "))] }),
          new Paragraph({ children: [new TextRun({ text: "Evidencias: ", bold: true }), new TextRun(p.evaluacion.evidencias.join(", "))] }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "RECURSOS", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: "Materiales físicos: ", bold: true }), new TextRun(p.recursos.materialesFisicos.join(", "))] }),
          new Paragraph({ children: [new TextRun({ text: "Recursos digitales: ", bold: true }), new TextRun(p.recursos.recursosDigitales.join(", "))] }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "INDICADORES DE EVALUACIÓN", heading: HeadingLevel.HEADING_2 }),
          ...p.indicadoresEvaluacion.map(ind => new Paragraph({ text: `• ${ind}` })),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Planificacion_${d.area}_${d.grado}.docx`);
  };

  const exportarPDF = () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margen = 20;
    const ancho = 170;
    let y = 20;

    const salto = (extra = 6) => { y += extra; if (y > 270) { pdf.addPage(); y = 20; } };
    const titulo = (texto) => { pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(26, 54, 93); const lineas = pdf.splitTextToSize(texto, ancho); pdf.text(lineas, margen, y); y += lineas.length * 6; salto(3); };
    const subtitulo = (texto) => { pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(43, 108, 176); const lineas = pdf.splitTextToSize(texto, ancho); pdf.text(lineas, margen, y); y += lineas.length * 5; salto(2); };
    const cuerpo = (texto) => { pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60); const lineas = pdf.splitTextToSize(texto, ancho); pdf.text(lineas, margen, y); y += lineas.length * 5; salto(2); };
    const campo = (etiqueta, valor) => { pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(60, 60, 60); pdf.text(`${etiqueta}:`, margen, y); pdf.setFont("helvetica", "normal"); const lineas = pdf.splitTextToSize(valor || "", ancho - 40); pdf.text(lineas, margen + 38, y); y += Math.max(lineas.length * 5, 6); };

    pdf.setFontSize(16); pdf.setFont("helvetica", "bold"); pdf.setTextColor(26, 54, 93);
    pdf.text("PLANIFICACIÓN MICROCURRICULAR", 105, y, { align: "center" }); salto(5);
    pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 100, 100);
    pdf.text("Ministerio de Educación del Ecuador", 105, y, { align: "center" }); salto(8);

    titulo("DATOS INFORMATIVOS");
    campo("Institución", d.institucion); campo("Docente", d.docente);
    campo("Área", d.area); campo("Grado", d.grado);
    campo("Fecha", d.fecha); campo("Tiempo", d.tiempo); salto(4);

    titulo("OBJETIVO DE APRENDIZAJE");
    cuerpo(p.objetivoAprendizaje); salto(4);

    titulo("DESTREZAS CON CRITERIO DE DESEMPEÑO");
    p.destrezas.forEach(dest => cuerpo(`${dest.codigo}: ${dest.descripcion}`)); salto(4);

    titulo("EJES TRANSVERSALES");
    cuerpo(p.ejesTransversales); salto(4);

    titulo("METODOLOGÍA");
    subtitulo(`Anticipación (${m.anticipacion.duracion})`);
    cuerpo(`Estrategia: ${m.anticipacion.estrategia}`);
    m.anticipacion.actividades.forEach(a => cuerpo(`• ${a}`)); salto(2);
    subtitulo(`Construcción (${m.construccion.duracion})`);
    cuerpo(`Estrategia: ${m.construccion.estrategia}`);
    m.construccion.actividades.forEach(a => cuerpo(`• ${a}`)); salto(2);
    subtitulo(`Consolidación (${m.consolidacion.duracion})`);
    cuerpo(`Estrategia: ${m.consolidacion.estrategia}`);
    m.consolidacion.actividades.forEach(a => cuerpo(`• ${a}`)); salto(4);

    titulo("DUA - DISEÑO UNIVERSAL PARA EL APRENDIZAJE");
    campo("Representación", p.dua.representacion);
    campo("Acción y expresión", p.dua.accionExpresion);
    campo("Motivación", p.dua.motivacion); salto(4);

    titulo("EVALUACIÓN");
    campo("Técnicas", p.evaluacion.tecnicas.join(", "));
    campo("Instrumentos", p.evaluacion.instrumentos.join(", "));
    campo("Criterios", p.evaluacion.criterios.join(", "));
    campo("Evidencias", p.evaluacion.evidencias.join(", ")); salto(4);

    titulo("RECURSOS");
    campo("Materiales físicos", p.recursos.materialesFisicos.join(", "));
    campo("Recursos digitales", p.recursos.recursosDigitales.join(", ")); salto(4);

    titulo("INDICADORES DE EVALUACIÓN");
    p.indicadoresEvaluacion.forEach(ind => cuerpo(`• ${ind}`));

    pdf.save(`Planificacion_${d.area}_${d.grado}.pdf`);
  };

  return (
    <div className="vista-plan">

      <div className="botones-exportar">
        <button className="boton-word" onClick={exportarWord}>
          📄 Descargar Word
        </button>
        <button className="boton-pdf" onClick={exportarPDF}>
          📑 Descargar PDF
        </button>
      </div>

      <div className="seccion encabezado-plan">
        <h2>Planificación Microcurricular</h2>
        <div className="fila-dos">
          <p><strong>Institución:</strong> {d.institucion}</p>
          <p><strong>Docente:</strong> {d.docente}</p>
          <p><strong>Área:</strong> {d.area}</p>
          <p><strong>Grado:</strong> {d.grado}</p>
          <p><strong>Fecha:</strong> {d.fecha}</p>
          <p><strong>Tiempo:</strong> {d.tiempo}</p>
        </div>
      </div>

      <div className="seccion">
        <h3>Objetivo de aprendizaje</h3>
        <p>{p.objetivoAprendizaje}</p>
      </div>

      <div className="seccion">
        <h3>Destrezas con criterio de desempeño</h3>
        {p.destrezas.map((dest, i) => (
          <div key={i} className="destreza-item">
            <span className="codigo">{dest.codigo}</span>
            <span>{dest.descripcion}</span>
          </div>
        ))}
      </div>

      <div className="seccion">
        <h3>Ejes transversales</h3>
        <p>{p.ejesTransversales}</p>
      </div>

      <div className="seccion">
        <h3>Metodología</h3>
        {["anticipacion", "construccion", "consolidacion"].map((fase) => (
          <div key={fase} className="fase-box">
            <h4>
              {fase === "anticipacion" ? "🔵 Anticipación" :
               fase === "construccion" ? "🟡 Construcción" : "🟢 Consolidación"}
              <span className="duracion">{m[fase].duracion}</span>
            </h4>
            <p><em>Estrategia: {m[fase].estrategia}</em></p>
            <ul>
              {m[fase].actividades.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="seccion">
        <h3>Diseño Universal para el Aprendizaje (DUA)</h3>
        <div className="dua-grid">
          <div className="dua-item">
            <strong>Representación</strong>
            <p>{p.dua.representacion}</p>
          </div>
          <div className="dua-item">
            <strong>Acción y expresión</strong>
            <p>{p.dua.accionExpresion}</p>
          </div>
          <div className="dua-item">
            <strong>Motivación</strong>
            <p>{p.dua.motivacion}</p>
          </div>
        </div>
      </div>

      <div className="seccion">
        <h3>Evaluación</h3>
        <div className="fila-dos">
          <div>
            <strong>Técnicas</strong>
            <ul>{p.evaluacion.tecnicas.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div>
            <strong>Instrumentos</strong>
            <ul>{p.evaluacion.instrumentos.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div>
            <strong>Criterios</strong>
            <ul>{p.evaluacion.criterios.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div>
            <strong>Evidencias</strong>
            <ul>{p.evaluacion.evidencias.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="seccion">
        <h3>Recursos</h3>
        <div className="fila-dos">
          <div>
            <strong>Materiales físicos</strong>
            <ul>{p.recursos.materialesFisicos.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          <div>
            <strong>Recursos digitales</strong>
            <ul>{p.recursos.recursosDigitales.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="seccion">
        <h3>Indicadores de evaluación</h3>
        <ul>
          {p.indicadoresEvaluacion.map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}

export default VistaPlan;
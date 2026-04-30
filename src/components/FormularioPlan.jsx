import React, { useState } from "react";

const niveles = {
  "Educación General Básica": {
    subniveles: ["Preparatoria", "Elemental", "Media", "Superior"],
    grados: {
      "Preparatoria": ["1° grado"],
      "Elemental": ["2° grado", "3° grado", "4° grado"],
      "Media": ["5° grado", "6° grado", "7° grado"],
      "Superior": ["8° grado", "9° grado", "10° grado"],
    },
  },
  "Bachillerato General Unificado": {
    subniveles: ["Bachillerato"],
    grados: {
      "Bachillerato": ["1° BGU", "2° BGU", "3° BGU"],
    },
  },
};

const asignaturas = [
  "Lengua y Literatura",
  "Lenguaje",
  "Matemática",
  "Ciencias Naturales",
  "Estudios Sociales",
  "Educación Cultural y Artística",
  "Educación Física",
  "Inglés",
  "Emprendimiento y Gestión",
];

function FormularioPlan({ onGenerar, cargando }) {
  const [form, setForm] = useState({
    institucion: "",
    docente: "",
    nivel: "",
    subnivel: "",
    grado: "",
    asignatura: "",
    tema: "",
    tiempo: "40",
    fecha: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const nuevo = { ...prev, [name]: value };
      if (name === "nivel") { nuevo.subnivel = ""; nuevo.grado = ""; }
      if (name === "subnivel") { nuevo.grado = ""; }
      return nuevo;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerar(form);
  };

  const subnivelesDisponibles = form.nivel
    ? niveles[form.nivel]?.subniveles || []
    : [];

  const gradosDisponibles = form.subnivel
    ? niveles[form.nivel]?.grados[form.subnivel] || []
    : [];

  const completo =
    form.institucion && form.docente && form.nivel &&
    form.subnivel && form.grado && form.asignatura && form.tema;

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Datos de la planificación</h2>

      <div className="fila-dos">
        <div className="campo">
          <label>Institución educativa</label>
          <input
            name="institucion"
            value={form.institucion}
            onChange={handleChange}
            placeholder="Ej: Unidad Educativa..."
          />
        </div>
        <div className="campo">
          <label>Nombre del docente</label>
          <input
            name="docente"
            value={form.docente}
            onChange={handleChange}
            placeholder="Tu nombre completo"
          />
        </div>
      </div>

      <div className="fila-tres">
        <div className="campo">
          <label>Nivel educativo</label>
          <select name="nivel" value={form.nivel} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            {Object.keys(niveles).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Subnivel</label>
          <select name="subnivel" value={form.subnivel} onChange={handleChange} disabled={!form.nivel}>
            <option value="">Seleccionar...</option>
            {subnivelesDisponibles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Grado / Curso</label>
          <select name="grado" value={form.grado} onChange={handleChange} disabled={!form.subnivel}>
            <option value="">Seleccionar...</option>
            {gradosDisponibles.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="fila-dos">
        <div className="campo">
          <label>Asignatura</label>
          <select name="asignatura" value={form.asignatura} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            {asignaturas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>⏱ Tiempo de clase</label>
          <select name="tiempo" value={form.tiempo} onChange={handleChange}>
            <option value="35">35 minutos</option>
            <option value="40">40 minutos</option>
          </select>
        </div>
      </div>

      <div className="fila-dos">
        <div className="campo">
          <label>Tema de la clase</label>
          <input
            name="tema"
            value={form.tema}
            onChange={handleChange}
            placeholder="Ej: La célula y sus partes"
          />
        </div>
        <div className="campo">
          <label>Fecha</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        className="boton-generar"
        disabled={!completo || cargando}
      >
        {cargando ? "Generando..." : "✨ Generar planificación"}
      </button>
    </form>
  );
}

export default FormularioPlan;
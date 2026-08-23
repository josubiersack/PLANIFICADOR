import React, { useState } from "react";
import FormularioPlan from "./components/FormularioPlan";
import VistaPlan from "./components/VistaPlan";
import FormularioUEPA from "./components/FormularioUEPA";
import "./App.css";

function App() {
  const [pestanaActiva, setPestanaActiva] = useState("minedu");
  const [planificacion, setPlanificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const generarPlan = async (datos) => {
    setCargando(true);
    setError(null);
    setPlanificacion(null);
    try {
      const respuesta = await fetch("/.netlify/functions/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const raw = await respuesta.text();
      let data;
      try { data = JSON.parse(raw); } catch {
        setError("La función devolvió HTML en vez de JSON. Si estás en localhost:3000, usa 'netlify dev' en vez de 'npm start'.");
        return;
      }
      if (data.error) setError(data.error);
      else setPlanificacion(data);
    } catch (err) {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
    setPlanificacion(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Planificador Docente</h1>
        <p>Unidad Educativa Particular Americano</p>
      </header>

      <div className="pestanas">
        <button
          className={`pestana-btn ${pestanaActiva === "minedu" ? "activa" : ""}`}
          onClick={() => cambiarPestana("minedu")}
        >
          📋 Formato MinEduc
        </button>
        <button
          className={`pestana-btn ${pestanaActiva === "uepa" ? "activa" : ""}`}
          onClick={() => cambiarPestana("uepa")}
        >
          🏫 Formato UEPA
        </button>
      </div>

      <main className="app-main">
        {pestanaActiva === "minedu" && (
          <>
            <FormularioPlan onGenerar={generarPlan} cargando={cargando} />
            {error && <div className="error-box"><p>⚠️ {error}</p></div>}
            {cargando && <div className="cargando-box"><p>✨ Generando tu planificación... esto toma unos segundos</p></div>}
            {planificacion && <VistaPlan planificacion={planificacion} />}
          </>
        )}
        {pestanaActiva === "uepa" && (
          <FormularioUEPA />
        )}
      </main>
    </div>
  );
}

export default App;
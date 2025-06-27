// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const botonAyuda = document.getElementById("boton-ayuda");
  const ventanaAyuda = document.getElementById("ventana-ayuda");
  const cerrarAyuda = document.getElementById("cerrar-ayuda");
  const pestañas = document.querySelectorAll(".pestana");
  const contenidos = document.querySelectorAll(".contenido-pestana");

  // Mostrar u ocultar la ventana de ayuda
  botonAyuda.addEventListener("click", () => {
    ventanaAyuda.style.display = ventanaAyuda.style.display === "block" ? "none" : "block";
  });

  // Cerrar con el botón (X)
  cerrarAyuda.addEventListener("click", () => {
    ventanaAyuda.style.display = "none";
  });

  // Cambiar de pestaña
  pestañas.forEach(pestana => {
    pestana.addEventListener("click", () => {
      // Quitar clase activa de todas las pestañas
      pestañas.forEach(p => p.classList.remove("activa"));
      // Ocultar todos los contenidos
      contenidos.forEach(c => c.classList.remove("activa"));

      // Activar la pestaña actual
      pestana.classList.add("activa");

      // Mostrar el contenido correspondiente
      const tab = pestana.getAttribute("data-tab");
      document.getElementById(tab).classList.add("activa");
    });
  });

  // Mostrar/ocultar respuestas FAQ con efecto acordeón
  const preguntas = document.querySelectorAll(".pregunta-faq");

  preguntas.forEach(pregunta => {
    pregunta.addEventListener("click", () => {
      // Cerrar todas las respuestas activas
      preguntas.forEach(p => p.classList.remove("activa"));

      // Abrir solo la que se ha hecho clic
      pregunta.classList.add("activa");
    });
  });

});
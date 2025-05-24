// Escuchar mensajes desde popup.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "fillForm") {
    fillCourtForm(request.code);
  }
});

// Convertir el código en campos individuales
function convertCourtCode(code) {
  if (!/^\d{23}$/.test(code)) {
    throw new Error("El código debe tener exactamente 23 dígitos numéricos");
  }
  return {
    departamento: code.substring(0, 2),
    ciudad: code.substring(0, 5),
    corporacion: code.substring(5, 7),
    especialidad: code.substring(7, 9),
    despacho: code.substring(9, 12)
  };
}

// Función para seleccionar opciones en dropdowns
function selectDropdown(selector, number) {
  const dropdown = document.querySelector(selector);
  if (!dropdown) {
    throw new Error(`No se encontró el dropdown ${selector}`);
  }

  const options = Array.from(dropdown.options);
  const matchOption = options.find(opt => opt.text.includes(number));

  if (matchOption) {
    dropdown.value = matchOption.value;
    dropdown.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    throw new Error(`No se encontró opción para número ${number} en ${selector}`);
  }
}

// Función principal para llenar formulario
async function fillCourtForm(code) {
  try {
    const fields = convertCourtCode(code);

    const dropdowns = [
      ["#MainContent_ddlDepartamento", fields.departamento],
      ["#MainContent_ddlCiudad", fields.ciudad],
      ["#MainContent_ddlCorporacion", fields.corporacion],
      ["#MainContent_ddlEspecialidad", fields.especialidad],
      ["#MainContent_ddlDespacho", fields.despacho]
    ];

    for (const [selector, value] of dropdowns) {
      selectDropdown(selector, value);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar carga
    }

    // Llenar campo del código
    const codigoProceso = document.querySelector("#MainContent_txtCodigoProceso");
    if (!codigoProceso) throw new Error("Campo 'Código Proceso' no encontrado.");

    codigoProceso.value = code;
    codigoProceso.dispatchEvent(new Event('input', { bubbles: true }));

  } catch (e) {
    alert("Error al llenar formulario: " + e.message);
  }
}

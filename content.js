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

// Insertar badge de patrocinador Wabog
(function injectSponsorBadge() {
  const link = document.createElement('a');
  link.href = "https://wabog.com";
  link.target = "_blank";
  link.style.position = "fixed";
  link.style.bottom = "10px";
  link.style.right = "10px";
  link.style.zIndex = "10000";
  link.style.width = "30px";
  link.style.height = "30px";
  link.style.opacity = "0.7";
  link.style.backgroundColor = "white";
  link.style.borderRadius = "50%";
  link.style.transition = "opacity 0.2s";
  link.addEventListener("mouseenter", () => link.style.opacity = "1");
  link.addEventListener("mouseleave", () => link.style.opacity = "0.7");

  const img = document.createElement('img');
  img.src = chrome.runtime.getURL("assets/wabog_name_logo_light.webp");
  img.style.width = "100%";
  img.style.height = "100%";
  img.alt = "Wabog";
  
  link.appendChild(img);
  document.body.appendChild(link);
})();

// Insertar logo de la rama judicial
(function injectRamaLogo() {
  const ramaLink = document.createElement('a');
  ramaLink.href = "https://www.ramajudicial.gov.co";
  ramaLink.target = "_blank";
  ramaLink.style.position = "fixed";
  ramaLink.style.bottom = "50px";
  ramaLink.style.right = "10px";
  ramaLink.style.zIndex = "10000";
  ramaLink.style.width = "30px";
  ramaLink.style.height = "30px";
  ramaLink.style.opacity = "0.7";
  ramaLink.style.transition = "opacity 0.2s";
  ramaLink.style.backgroundColor = "white";
  ramaLink.style.borderRadius = "50%";
  ramaLink.addEventListener("mouseenter", () => ramaLink.style.opacity = "1");
  ramaLink.addEventListener("mouseleave", () => ramaLink.style.opacity = "0.7");

  const ramaImg = document.createElement('img');
  ramaImg.src = "URL_DEL_LOGO_DE_LA_RAMA"; // Reemplaza con la URL del logo de la rama
  ramaImg.style.width = "100%";
  ramaImg.style.height = "100%";
  ramaImg.alt = "Rama Judicial";
  
  ramaLink.appendChild(ramaImg);
  document.body.appendChild(ramaLink);
})();

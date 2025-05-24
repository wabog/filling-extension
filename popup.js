document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();
  const code = document.getElementById("courtCode").value;
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const url = new URL(tabs[0].url);
    if (url.hostname.includes("ramajudicial.gov.co")) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "fillForm", code: code}, response => {
        if (chrome.runtime.lastError) {
          document.getElementById("error").textContent = "Error: " + chrome.runtime.lastError.message;
          document.getElementById("error").style.display = "block";
        }
      });
    } else {
      document.getElementById("error").textContent = "Debes ingresar a la página de la rama primero.";
      document.getElementById("error").style.display = "block";
    }
  });
});

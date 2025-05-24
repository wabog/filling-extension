document.addEventListener('DOMContentLoaded', function() {
  const courtCodeInput = document.getElementById('courtCode');
  const submitButton = document.getElementById('submit');
  const errorDiv = document.getElementById('error');
  const historyList = document.getElementById('historyList');
  const clearAllBtn = document.getElementById('clearAll');

  // Cargar historial al iniciar
  loadHistory();

  // Manejar envío del formulario
  submitButton.addEventListener('click', function() {
    const code = courtCodeInput.value.trim();

    if (!code) {
      showError('Por favor ingresa un código');
      return;
    }

    if (!/^\d{23}$/.test(code)) {
      showError('El código debe tener exactamente 23 dígitos');
      return;
    }

    // Guardar en historial antes de procesar
    saveToHistory(code);

    // Enviar mensaje al content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "fillForm",
        code: code
      }, function(response) {
        if (chrome.runtime.lastError) {
          showError('Error: Asegúrate de estar en la página correcta de la Rama Judicial');
        } else {
          hideError();
          courtCodeInput.value = '';
        }
      });
    });
  });

  // Permitir envío con Enter
  courtCodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      submitButton.click();
    }
  });

  // Limpiar todo el historial
  clearAllBtn.addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
      chrome.storage.local.clear(function() {
        loadHistory();
      });
    }
  });

  // Funciones del historial
  function saveToHistory(code) {
    chrome.storage.local.get(['courtHistory'], function(result) {
      let history = result.courtHistory || [];

      // Evitar duplicados
      history = history.filter(item => item !== code);

      // Agregar al inicio
      history.unshift(code);

      // Mantener solo los últimos 10
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      chrome.storage.local.set({courtHistory: history}, function() {
        loadHistory();
      });
    });
  }

  function loadHistory() {
    chrome.storage.local.get(['courtHistory'], function(result) {
      const history = result.courtHistory || [];
      renderHistory(history);
    });
  }

  function renderHistory(history) {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No hay códigos en el historial</div>';
      clearAllBtn.style.display = 'none';
      return;
    }

    clearAllBtn.style.display = 'block';

    historyList.innerHTML = history.map(code => `
      <div class="history-item">
        <span class="history-code" onclick="window.selectFromHistory('${code}')">${code}</span>
        <button class="delete-btn" onclick="window.deleteFromHistory('${code}')" title="Eliminar">🗑</button>
      </div>
    `).join('');
  }

  // Funciones globales para los eventos onclick
  window.selectFromHistory = function(code) {
    courtCodeInput.value = code;
    courtCodeInput.focus();
  };

  window.deleteFromHistory = function(code) {
    chrome.storage.local.get(['courtHistory'], function(result) {
      let history = result.courtHistory || [];
      history = history.filter(item => item !== code);

      chrome.storage.local.set({courtHistory: history}, function() {
        loadHistory();
      });
    });
  };

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  function hideError() {
    errorDiv.style.display = 'none';
  }
});

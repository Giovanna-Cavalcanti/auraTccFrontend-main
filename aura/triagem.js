// ============================================
// TRIAGEM.JS - INTEGRAÇÃO COM BACKEND
// ============================================

// --- Funções Auxiliares Globais ---

// Função para obter o token (se usar autenticação)
function getToken() {
  return localStorage.getItem('token');
}

// Função para obter o ID do paciente do localStorage
function getPacienteId() {
  const id = localStorage.getItem("pacienteId");
  if (!id) {
    alert("⚠️ ID do paciente não encontrado. Faça login novamente.");
    throw new Error("Paciente ID não encontrado no localStorage.");
  }
  return id;
}

// --- Elementos do DOM ---
const modal = document.getElementById("triagemModal");
const confirmModal = document.getElementById("confirmModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModal");
const closeConfirmBtn = document.getElementById("closeConfirm");

// Função para abrir o modal de triagem
function abrirTriagem() {
  modal.style.display = "flex";
}

// Event listeners para abrir/fechar modais
if (openBtn) {
  openBtn.onclick = abrirTriagem;
}

if (closeBtn) {
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
}

if (closeConfirmBtn) {
  closeConfirmBtn.onclick = () => (confirmModal.style.display = "none");
}

// Fechar modal clicando fora
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
  if (event.target === confirmModal) {
    confirmModal.style.display = "none";
  }
};

// ============================================
// INTEGRAÇÃO COM BACKEND - ENVIAR TRIAGEM
// ============================================

document
  .getElementById("triagemForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    const formData = new FormData(this);
    const dados = {};
    formData.forEach((value, key) => (dados[key] = value));
    
    console.log("📋 Dados coletados do formulário:", dados);
    
    try {
      // Pegar o ID do paciente do localStorage (DINÂMICO)
      const pacienteId = getPacienteId();
      console.log("👤 Paciente ID:", pacienteId);
      
      // Preparar dados para enviar ao backend
      const triagemData = {
        pacienteId: pacienteId,
        motivo: dados.motivo,
        tempoSintomas: dados.tempoSintomas,
        frequencia: dados.frequencia,
        genero: dados.genero
      };
      
      console.log("📤 Enviando para o backend:", triagemData);
      
      // Preparar headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fazer requisição POST para o backend
      const response = await fetch('https://auratccbackend.onrender.com/api/triagem', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(triagemData)
      });
      
      const text = await response.text();
      let resultado;
      
      try {
        resultado = text ? JSON.parse(text) : {};
      } catch (err) {
        resultado = { raw: text };
      }
      
      console.log("📥 Resposta do servidor:", resultado, "status:", response.status);
      
      if (response.ok) {
        // Sucesso! Fechar modal da triagem e mostrar confirmação
        modal.style.display = "none";
        confirmModal.style.display = "flex";
        
        console.log("✅ Triagem salva com sucesso!");
        
        // Fechar modal de confirmação automaticamente após 3 segundos
        setTimeout(() => {
          confirmModal.style.display = "none";
        }, 3000);
        
        // Limpar formulário
        document.getElementById("triagemForm").reset();
        
      } else {
        // Erro retornado pelo backend
        const msg = resultado.message || resultado.error || JSON.stringify(resultado);
        alert('❌ Erro ao salvar triagem: ' + msg);
        console.error("❌ Erro do backend:", resultado);
      }
      
    } catch (error) {
      // Erro de conexão ou ID não encontrado
      console.error('❌ Erro ao processar triagem:', error);
      
      if (error.message.includes("Paciente ID não encontrado")) {
        // Já mostrou o alert na função getPacienteId()
      } else {
        alert('❌ Erro ao conectar com o servidor. Verifique sua conexão.');
      }
    }
  });

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Função para carregar triagem existente do paciente
async function carregarTriagem() {
  try {
    const pacienteId = getPacienteId();
    console.log("📋 Carregando triagem do paciente:", pacienteId);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`https://auratccbackend.onrender.com/api/triagem/${pacienteId}`, {
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      const resultado = await response.json();
      console.log("📥 Triagem do paciente:", resultado);
      
      // Aqui você pode preencher o formulário com os dados existentes
      // ou mostrar uma mensagem de que a triagem já foi feita
      preencherFormularioTriagem(resultado.triagem);
      
      return resultado.triagem;
    } else if (response.status === 404) {
      console.log("ℹ️ Paciente ainda não tem triagem cadastrada");
      return null;
    } else {
      console.error("❌ Erro ao carregar triagem:", await response.json());
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar triagem:', error);
    return null;
  }
}

// Função para preencher o formulário com dados existentes (opcional)
function preencherFormularioTriagem(triagem) {
  if (!triagem) return;
  
  console.log("✏️ Preenchendo formulário com dados existentes");
  
  // Preenche os campos do formulário se já houver triagem
  const form = document.getElementById("triagemForm");
  if (form) {
    if (triagem.motivo) form.querySelector('[name="motivo"]').value = triagem.motivo;
    if (triagem.tempoSintomas) form.querySelector('[name="tempoSintomas"]').value = triagem.tempoSintomas;
    if (triagem.frequencia) form.querySelector('[name="frequencia"]').value = triagem.frequencia;
    if (triagem.genero) form.querySelector('[name="genero"]').value = triagem.genero;
  }
  
  // Opcional: Mostrar mensagem informando que já tem triagem
  // alert("ℹ️ Você já possui uma triagem cadastrada. Pode atualizá-la se necessário.");
}

// Verificar se já tem triagem ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ Script de triagem carregado!");
  console.log("👤 Paciente ID encontrado:", localStorage.getItem('pacienteId'));
  
  // Opcional: carregar triagem existente ao abrir a página
  // Descomente a linha abaixo se quiser carregar automaticamente
  // carregarTriagem();
});

console.log("🎯 triagem.js carregado com sucesso!");
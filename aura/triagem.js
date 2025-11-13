// ============================================
// TRIAGEM.JS - INTEGRAÇÃO COM BACKEND
// ============================================

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
    
    console.log("Dados da triagem:", dados);
    
    try {
      // IMPORTANTE: Substituir pelo ID real do paciente
      // Em produção, pegar do localStorage ou JWT token
      const pacienteId = "68a619fee09cd6f8b93f16c8"; // ID DE EXEMPLO
      
      // Preparar dados para enviar ao backend
      const triagemData = {
        pacienteId: pacienteId,
        motivo: dados.motivo,
        tempoSintomas: dados.tempoSintomas,
        frequencia: dados.frequencia,
        genero: dados.genero
      };
      
      console.log("Enviando para o backend:", triagemData);
      
      // Fazer requisição POST para o backend
      const response = await fetch('https://auratccbackend.onrender.com/api/triagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Se tiver autenticação JWT, adicionar aqui:
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(triagemData)
      });
      
      const resultado = await response.json();
      console.log("Resposta do servidor:", resultado);
      
      if (response.ok) {
        // Sucesso! Fechar modal da triagem e mostrar confirmação
        modal.style.display = "none";
        confirmModal.style.display = "flex";
        
        // Fechar modal de confirmação automaticamente após 3 segundos
        setTimeout(() => {
          confirmModal.style.display = "none";
        }, 3000);
        
        // Limpar formulário
        document.getElementById("triagemForm").reset();
        
      } else {
        // Erro retornado pelo backend
        alert('❌ Erro ao salvar triagem: ' + (resultado.error || 'Tente novamente'));
        console.error("Erro do backend:", resultado);
      }
      
    } catch (error) {
      // Erro de conexão
      console.error('Erro ao conectar com o servidor:', error);
      alert('❌ Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  });

// ============================================
// FUNÇÕES AUXILIARES (OPCIONAL)
// ============================================

// Função para carregar triagem existente do paciente
async function carregarTriagem() {
  try {
    const pacienteId = "68a619fee09cd6f8b93f16c8"; // ID DE EXEMPLO
    
    const response = await fetch(`https://auratccbackend.onrender.com/api/triagem/${pacienteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Se tiver autenticação JWT, adicionar aqui:
        // 'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const resultado = await response.json();
      console.log("Triagem do paciente:", resultado);
      
      // Aqui você pode preencher o formulário com os dados existentes
      // ou mostrar uma mensagem de que a triagem já foi feita
      
      return resultado.triagem;
    } else {
      console.log("Paciente ainda não tem triagem cadastrada");
      return null;
    }
    
  } catch (error) {
    console.error('Erro ao carregar triagem:', error);
    return null;
  }
}

// Verificar se já tem triagem ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ Script de triagem carregado!");
  
  // Opcional: carregar triagem existente
  // carregarTriagem();
});

console.log("🎯 triagem.js carregado com sucesso!");
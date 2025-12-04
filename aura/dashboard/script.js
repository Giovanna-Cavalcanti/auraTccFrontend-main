// ===== DATA MANAGEMENT WITH LOCALSTORAGE =====
const DataManager = {
  // Initialize default data
  init() {
    if (!localStorage.getItem("appointments")) {
      this.saveAppointments([]);
    }

    if (!localStorage.getItem("posts")) {
      this.savePosts([]);
    }

    if (!localStorage.getItem("activities")) {
      this.saveActivities([]);
    }

    if (!localStorage.getItem("analyses")) {
      this.saveAnalyses({});
    }

    if (!localStorage.getItem("contactRequests")) {
      localStorage.setItem("contactRequests", "true")
    }

    if (!localStorage.getItem("taskNotifications")) {
      localStorage.setItem("taskNotifications", "true")
    }

    if (!localStorage.getItem("doctorInfo")) {
      this.saveDoctorInfo({ name: "Dr(a)", email: "user@email.com" })
    }
  },

  getAppointments() {
    return JSON.parse(localStorage.getItem("appointments") || "[]")
  },

  saveAppointments(appointments) {
    localStorage.setItem("appointments", JSON.stringify(appointments))
  },

  getPosts() {
    return JSON.parse(localStorage.getItem("posts") || "[]")
  },

  savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts))
  },

  getActivities() {
    return JSON.parse(localStorage.getItem("activities") || "[]")
  },

  saveActivities(activities) {
    localStorage.setItem("activities", JSON.stringify(activities))
  },

  getAnalyses() {
    return JSON.parse(localStorage.getItem("analyses") || "{}")
  },

  saveAnalyses(analyses) {
    localStorage.setItem("analyses", JSON.stringify(analyses))
  },

  getContactRequests() {
    return localStorage.getItem("contactRequests") === "true"
  },

  clearContactRequests() {
    localStorage.setItem("contactRequests", "false")
  },

  getTaskNotifications() {
    return localStorage.getItem("taskNotifications") === "true"
  },

  clearTaskNotifications() {
    localStorage.setItem("taskNotifications", "false")
  },

  getDoctorInfo() {
    return JSON.parse(localStorage.getItem("doctorInfo") || '{"name":"Dr(a)","email":"user@email.com"}')
  },

  saveDoctorInfo(info) {
    localStorage.setItem("doctorInfo", JSON.stringify(info))
  },
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  DataManager.init()
  updateDate()
  initHomePage()
  initAppointmentsPage()
  initPatientsPage()        // <-- initPatientsPage agora chama a função da API internamente
  initPatientDetailPage()
  initCommunityPage()
  initCreatePostPage()
  initActivitiesPage()
  initSettingsPage()
  initModals()
})

// ===== DATE MANAGEMENT =====
function updateDate() {
  const now = new Date()
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const dayName = days[now.getDay()]
  const day = String(now.getDate()).padStart(2, "0")
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  const dateElement = document.querySelector(".date-text")
  if (dateElement) {
    dateElement.textContent = `${dayName}, ${day} ${month}, ${year}`
  }
}

// ===== HOME PAGE =====
function initHomePage() {
  carregarSolicitacoesContato();  // <-- ADICIONE AQUI
  const todayAppointmentsContainer = document.getElementById("today-appointments")
  const postsContainer = document.getElementById("posts-container")
  const homePatientSearch = document.getElementById("home-patient-search")
  const contactRequestsCard = document.getElementById("contact-requests-card")
  const tasksCard = document.getElementById("tasks-card")
  const contactDot = document.getElementById("contact-dot")
  const tasksDot = document.getElementById("tasks-dot")

  if (todayAppointmentsContainer) {
    renderTodayAppointments()
  }

  if (postsContainer) {
    renderHomePosts()
  }

  if (homePatientSearch) {
    homePatientSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        window.location.href = `patients.html?search=${encodeURIComponent(e.target.value)}`
      }
    })
  }

  if (contactRequestsCard) {
    const hasRequests = DataManager.getContactRequests()
    if (contactDot) contactDot.style.display = hasRequests ? "block" : "none"

    contactRequestsCard.addEventListener("click", () => {
      if (DataManager.getContactRequests()) {
        document.getElementById("contact-request-modal")?.classList.add("active")
      }
    })
  }

  if (tasksCard) {
    const hasNotifications = DataManager.getTaskNotifications()
    if (tasksDot) tasksDot.style.display = hasNotifications ? "block" : "none"

    tasksCard.addEventListener("click", () => {
      if (DataManager.getTaskNotifications()) {
        document.getElementById("task-notification-modal")?.classList.add("active")
      }
    })
  }
}

function renderTodayAppointments() {
  const container = document.getElementById("today-appointments")
  if (!container) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appointments = DataManager.getAppointments()
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.fullDate)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime() && apt.status === "agendada"
  })

  if (todayAppointments.length === 0) {
    container.innerHTML = '<p class="no-appointments">Você não tem consultas para hoje</p>'
    return
  }

  container.innerHTML = todayAppointments
    .slice(0, 3)
    .map(
      (apt) => `
    <div class="appointment-card">
      <div class="appointment-header">
        <div class="appointment-line"></div>
        <div class="appointment-date">
          <div class="date-circle">
            <div class="date-number">${apt.date.split("/")[0]}</div>
          </div>
          <div class="date-info">
            <div class="day-name">Segunda</div>
            <div class="time">${apt.time}</div>
          </div>
        </div>
      </div>
      <div class="appointment-body">
        <p class="appointment-desc">Conferência online com Paciente ${apt.patient}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

function renderHomePosts() {
  const container = document.getElementById("posts-container")
  if (!container) return

  const userId = localStorage.getItem("userId");
  const posts = DataManager.getPosts().filter(p => p.professionalId === userId);

  if (posts.length === 0) {
    container.innerHTML = '<p class="no-posts">Você ainda não tem postagens publicadas</p>'
    return
  }

  container.innerHTML = posts
    .slice(-2)
    .reverse()
    .map(
      (post) => `
    <div class="post-card" onclick="window.location.href='community.html?post=${post.id}'">
      <h3 class="post-title">${post.title}</h3>
      <p class="post-date">${post.date}</p>
      <div class="post-actions">
        <div class="post-action">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 21C12 21 3 16 3 9C3 7.34783 3.63214 5.8043 4.75736 4.67157C5.88258 3.53884 7.41283 2.9 9.05 2.9C10.35 2.9 11.52 3.5 12.27 4.35C12.72 3.5 13.65 2.9 14.95 2.9C16.5872 2.9 18.1174 3.53884 19.2426 4.67157C20.3679 5.8043 21 7.34783 21 9C21 16 12 21 12 21Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>223</span>
        </div>
        <div class="post-action">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>223</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// ===== APPOINTMENTS PAGE =====
function initAppointmentsPage() {
  const appointmentsPage = document.getElementById("appointments-table")
  if (!appointmentsPage) return

  let currentFilter = "hoje"
  let currentTypeFilter = "all"

  renderAppointments(currentFilter, currentTypeFilter)

  // Filter buttons
  document.querySelectorAll(".filter-tab[data-filter]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab[data-filter]").forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")
      currentFilter = tab.dataset.filter
      renderAppointments(currentFilter, currentTypeFilter)
    })
  })

  // Type dropdown
  const typeDropdown = document.getElementById("type-dropdown")
  document.getElementById("type-filter-btn")?.addEventListener("click", (e) => {
    e.stopPropagation()
    typeDropdown?.classList.toggle("active")
  })

  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      currentTypeFilter = item.dataset.type
      typeDropdown?.classList.remove("active")
      renderAppointments(currentFilter, currentTypeFilter)
    })
  })

  // Add appointment modal
  const addBtn = document.getElementById("add-appointment-btn")
  const addModal = document.getElementById("add-appointment-modal")
  const patientSelect = document.getElementById("new-patient-select")

  addBtn?.addEventListener("click", () => addModal?.classList.add("active"))

  document.getElementById("save-add-appointment")?.addEventListener("click", () => {
    const patient = patientSelect?.value
    const type = document.getElementById("new-type")?.value
    const date = document.getElementById("new-date")?.value
    const time = document.getElementById("new-time")?.value

    if (patient && type && date && time) {
      const appointments = DataManager.getAppointments()
      const dateObj = new Date(date)
      const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`

      appointments.push({
        id: Date.now(),
        date: dateStr,
        time,
        patient,
        type,
        status: "agendada",
        fullDate: dateObj.toISOString(),
        professionalId: localStorage.getItem("userId")

      })

      DataManager.saveAppointments(appointments)
      renderAppointments(currentFilter, currentTypeFilter)
      renderTodayAppointments()
      addModal?.classList.remove("active")

      // Clear inputs
      patientSelect.value = ""
      document.getElementById("new-date").value = ""
      document.getElementById("new-time").value = ""
    }
  })

  document
    .getElementById("close-add-appointment")
    ?.addEventListener("click", () => addModal?.classList.remove("active"))
  document
    .getElementById("cancel-add-appointment")
    ?.addEventListener("click", () => addModal?.classList.remove("active"))
}

function renderAppointments(filter, typeFilter) {
  const tbody = document.getElementById("appointments-tbody")
  const noDataMsg = document.getElementById("no-appointments-message")
  const table = document.getElementById("appointments-table")

  if (!tbody) return

  let appointments = DataManager.getAppointments()

  // Filter by date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (filter === "hoje") {
    appointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.fullDate)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })
  } else if (filter === "semana") {
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)
    appointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.fullDate)
      return aptDate >= today && aptDate <= weekEnd
    })
  } else if (filter === "mes") {
    appointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.fullDate)
      return aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear()
    })
  }

  // Filter by type
  if (typeFilter && typeFilter !== "all") {
    if (typeFilter === "online" || typeFilter === "presencial") {
      appointments = appointments.filter((apt) => apt.type === typeFilter)
    } else {
      appointments = appointments.filter((apt) => apt.status === typeFilter)
    }
  }

  if (appointments.length === 0) {
    table.style.display = "none"
    noDataMsg.style.display = "block"
    return
  }

  table.style.display = "table"
  noDataMsg.style.display = "none"

  tbody.innerHTML = appointments
    .map((apt) => {
      const statusClass =
        apt.status === "concluida"
          ? "status-completed"
          : apt.status === "cancelada"
            ? "status-cancelled"
            : "status-scheduled"
      const statusText = apt.status.charAt(0).toUpperCase() + apt.status.slice(1)

      return `
      <tr data-id="${apt.id}">
        <td class="appointment-datetime">
          <div>${apt.date}</div>
          <div class="time-small">${apt.time}</div>
        </td>
        <td class="patient-name-cell">${apt.patient}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="appointment-actions">
          <button class="action-btn-small delete-appointment" data-id="${apt.id}" title="Excluir">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5H15M6 5V3C6 2.44772 6.44772 2 7 2H11C11.5523 2 12 2.44772 12 3V5M8 8V13M10 8V13M4 5L5 15C5 15.5523 5.44772 16 6 16H12C12.5523 16 13 15.5523 13 15L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="action-btn-small edit-appointment" data-id="${apt.id}" title="Editar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13 2L16 5L6 15H3V12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </td>
      </tr>
    `
    })
    .join("")

  // Attach event listeners
  tbody.querySelectorAll(".delete-appointment").forEach((btn) => {
    btn.addEventListener("click", () => deleteAppointment(btn.dataset.id))
  })

  tbody.querySelectorAll(".edit-appointment").forEach((btn) => {
    btn.addEventListener("click", () => openEditAppointment(btn.dataset.id))
  })
}

function deleteAppointment(id) {
  const modal = document.getElementById("delete-modal")
  modal.classList.add("active")

  document.getElementById("confirm-delete").onclick = () => {
    let appointments = DataManager.getAppointments()
    appointments = appointments.filter((apt) => apt.id !== Number.parseInt(id))
    DataManager.saveAppointments(appointments)
    renderAppointments("hoje", "all")
    renderTodayAppointments() // Update home page
    modal.classList.remove("active")
  }
}

function openEditAppointment(id) {
  const appointments = DataManager.getAppointments()
  const apt = appointments.find((a) => a.id === Number.parseInt(id))
  if (!apt) return

  const modal = document.getElementById("edit-appointment-modal")
  const statusSelect = document.getElementById("edit-status")
  const dateInput = document.getElementById("edit-date")
  const timeInput = document.getElementById("edit-time")

  statusSelect.value = apt.status
  dateInput.value = new Date(apt.fullDate).toISOString().split("T")[0]
  timeInput.value = apt.time

  modal.classList.add("active")

  document.getElementById("save-edit-appointment").onclick = () => {
    apt.status = statusSelect.value
    apt.time = timeInput.value

    const newDate = new Date(dateInput.value)
    apt.fullDate = newDate.toISOString()
    apt.date = `${String(newDate.getDate()).padStart(2, "0")}/${String(newDate.getMonth() + 1).padStart(2, "0")}`

    DataManager.saveAppointments(appointments)
    renderAppointments("hoje", "all")
    renderTodayAppointments()
    modal.classList.remove("active")
  }
}

// ===== PATIENTS PAGE =====
function initPatientsPage() {
  const patientSearch = document.getElementById("patient-search")
  const addPatientBtn = document.getElementById("add-patient-btn")

  // Se não tem o input de busca, não é a página de pacientes -> retorna
  if (!patientSearch) return

  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get("search")
  if (searchParam) {
    patientSearch.value = searchParam
    filterPatients(searchParam)
  }

  patientSearch.addEventListener("input", (e) => filterPatients(e.target.value))

  if (addPatientBtn) {
    addPatientBtn.addEventListener("click", () => {
      document.getElementById("add-patient-modal")?.classList.add("active")
    })

    document.getElementById("save-add-patient")?.addEventListener("click", () => {
      document.getElementById("add-patient-modal")?.classList.remove("active")
      document.getElementById("confirm-add-patient-modal")?.classList.add("active")
    })

    document.getElementById("confirm-confirm-patient")?.addEventListener("click", () => {
      const name = document.getElementById("new-patient-name")?.value
      const email = document.getElementById("new-patient-email")?.value
      const phone = document.getElementById("new-patient-phone")?.value

      if (name && email && phone) {
        const tbody = document.getElementById("patients-tbody")
        const newId = Date.now()
        const newRow = document.createElement("tr")
        newRow.dataset.id = newId
        newRow.dataset.name = name
        newRow.innerHTML = `
          <td class="patient-name">${name}</td>
          <td class="patient-email">${email}</td>
          <td class="patient-phone">${phone}</td>
          <td class="patient-actions">
            <button class="action-btn" title="Ver detalhes" onclick="window.location.href='patient-detail.html?id=${newId}'">Ver</button>
            <button class="action-btn delete-patient" title="Excluir">
              <img src="assets/icon-delete.svg" width="20">
            </button>
          </td>
        `
        tbody.appendChild(newRow)

        newRow.querySelector(".delete-patient").addEventListener("click", (e) => {
          e.stopPropagation()
          const modal = document.getElementById("delete-patient-modal")
          const rowToDelete = e.target.closest("tr")
          modal.classList.add("active")

          document.getElementById("confirm-delete-patient").onclick = () => {
            rowToDelete.remove()
            modal.classList.remove("active")
          }
        })
      }

      document.getElementById("confirm-add-patient-modal")?.classList.remove("active")
    })
  }

  // aqui chamamos a API para carregar pacientes (apenas na página patients)
  carregarPacientesDoProfissional()
}

function filterPatients(term) {
  const rows = document.querySelectorAll("#patients-tbody tr")
  const searchTerm = term.toLowerCase()
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(searchTerm) ? "" : "none"
  })
}

// ===== PATIENT DETAIL PAGE (NOVO E CORRETO) =====
async function initPatientDetailPage() {
  const page = document.querySelector(".container-patient-detail");
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const patientId = params.get("id");

  if (!patientId) {
    console.error("❌ Nenhum ID recebido na URL");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const resp = await fetch(`https://auratccbackend.onrender.com/api/pacientes/${patientId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const paciente = await resp.json();
    console.log("📌 Dados do paciente:", paciente);

    // Preenche os dados básicos
    document.querySelector(".patient-detail-name").textContent = paciente.nomeCompleto;
    document.querySelector(".patient-detail-birth").textContent =
      paciente.dataNascimento
        ? `Data de nascimento: ${paciente.dataNascimento}`
        : "Data de nascimento não informada";

    document.querySelector(".patient-detail-type").textContent =
      paciente.tipoAtendimento
        ? `Atendimento: ${paciente.tipoAtendimento}`
        : "Atendimento: -";

    // Modais
    const hTitle = document.getElementById("history-title");
    const tTitle = document.getElementById("tasks-title");

    if (hTitle) hTitle.textContent = `Histórico de Consultas - ${paciente.nomeCompleto}`;
    if (tTitle) tTitle.textContent = `Tarefas - ${paciente.nomeCompleto}`;

    // (se quiser carregar histórico e tarefas da API, coloque aqui)

  } catch (err) {
    console.error("❌ Erro ao carregar paciente:", err);
  }
}

// ===== COMMUNITY PAGE =====
function initCommunityPage() {
  const communityContainer = document.getElementById("community-container")
  if (!communityContainer) return

  let selectionMode = false
  const selectedPosts = new Set()

  renderCommunityPosts()

  document.getElementById("select-posts-btn")?.addEventListener("click", () => {
    selectionMode = !selectionMode
    selectedPosts.clear()
    renderCommunityPosts()
  })

  document.getElementById("delete-posts-btn")?.addEventListener("click", () => {
    if (selectedPosts.size > 0) {
      document.getElementById("delete-posts-modal")?.classList.add("active")
    }
  })

  document.getElementById("confirm-delete-posts")?.addEventListener("click", () => {
    let posts = DataManager.getPosts()
    posts = posts.filter((post) => !selectedPosts.has(post.id))
    DataManager.savePosts(posts)
    selectedPosts.clear()
    selectionMode = false
    renderCommunityPosts()
    renderHomePosts()
    document.getElementById("delete-posts-modal")?.classList.remove("active")
  })

  document.getElementById("cancel-delete-posts")?.addEventListener("click", () => {
    document.getElementById("delete-posts-modal")?.classList.remove("active")
  })

  function renderCommunityPosts() {
    const userId = localStorage.getItem("userId");
    const posts = DataManager.getPosts().filter(p => p.professionalId === userId);
    const postsList = document.getElementById("posts-list")
    const deleteBtn = document.getElementById("delete-posts-btn")
    const selectBtn = document.getElementById("select-posts-btn")

    if (!postsList) return

    if (posts.length === 0) {
      selectBtn.style.display = "none"
      postsList.innerHTML = '<p class="no-data-text">Você ainda não tem postagens publicadas</p>'
      return
    }

    selectBtn.style.display = "block"
    selectBtn.textContent = selectionMode ? "Cancelar" : "Selecionar Posts"
    deleteBtn.style.display = selectionMode && selectedPosts.size > 0 ? "block" : "none"

    postsList.innerHTML = posts
      .map((post) => {
        const checked = selectedPosts.has(post.id) ? "checked" : ""
        return `
        <div class="post-card" ${!selectionMode ? `onclick="window.location.href='community.html?post=${post.id}'"` : ""} style="cursor: ${selectionMode ? "default" : "pointer"}">
          ${selectionMode
            ? `
            <div class="post-checkbox-container">
              <input type="checkbox" class="post-checkbox" data-post-id="${post.id}" ${checked} onclick="event.stopPropagation()">
            </div>
          `
            : ""
          }
          <h3 class="post-title">${post.title}</h3>
          <p class="post-date">${post.date}</p>
          <div class="post-actions">
            <div class="post-action">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C12 21 3 16 3 9C3 7.34783 3.63214 5.8043 4.75736 4.67157C5.88258 3.53884 7.41283 2.9 9.05 2.9C10.35 2.9 11.52 3.5 12.27 4.35C12.72 3.5 13.65 2.9 14.95 2.9C16.5872 2.9 18.1174 3.53884 19.2426 4.67157C20.3679 5.8043 21 7.34783 21 9C21 16 12 21 12 21Z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>223</span>
            </div>
            <div class="post-action">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>223</span>
            </div>
          </div>
        </div>
      `
      })
      .join("")

    if (selectionMode) {
      document.querySelectorAll(".post-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const postId = Number.parseInt(e.target.dataset.postId)
          if (e.target.checked) {
            selectedPosts.add(postId)
          } else {
            selectedPosts.delete(postId)
          }
          deleteBtn.style.display = selectedPosts.size > 0 ? "block" : "none"
        })
      })
    }
  }
}

// ===== CREATE POST PAGE (ATUALIZADO) =====
function initCreatePostPage() {
  const publishBtn = document.getElementById("publish-btn")
  if (!publishBtn) return

  let selectedTags = []
  let selectedImage = null

  // Tags modal
  document.getElementById("tags-btn")?.addEventListener("click", () => {
    document.getElementById("tags-modal")?.classList.add("active")
  })

  document.getElementById("confirm-tags")?.addEventListener("click", () => {
    selectedTags = Array.from(document.querySelectorAll(".tag-checkbox:checked")).map((cb) => cb.value)
    document.getElementById("tags-modal")?.classList.remove("active")
  })

  document.getElementById("cancel-tags")?.addEventListener("click", () => {
    document.getElementById("tags-modal")?.classList.remove("active")
  })

  // Image attachment (se existir o botão)
  document.querySelector('.post-icon-btn[title="Anexar"]')?.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        selectedImage = true
      }
    }
    input.click()
  })

  // Publish
  publishBtn.addEventListener("click", () => {
    const title = document.getElementById("post-title")?.value
    const content = document.getElementById("post-content")?.value

    if (!title || !content) {
      alert("Por favor, preencha o título e o conteúdo da postagem");
      return;
    }

    document.getElementById("publish-modal")?.classList.add("active")
  })

  document.getElementById("cancel-publish")?.addEventListener("click", () => {
    document.getElementById("publish-modal")?.classList.remove("active")
  })

  document.getElementById("confirm-publish")?.addEventListener("click", () => {
    const title = document.getElementById("post-title")?.value
    const content = document.getElementById("post-content")?.value

    if (title && content) {
      const posts = DataManager.getPosts()
      const today = new Date()

      // IMPORTANTE: Adicionar isMine: true para posts criados pelo usuário
      const newPost = {
        id: Date.now(),
        title,
        content,
        tags: selectedTags,
        image: selectedImage,
        date: "...",
        likes: 0,
        comments: 0,
        isMine: true,
        professionalId: localStorage.getItem("userId")
      }

      posts.push(newPost)
      DataManager.savePosts(posts)
      
      console.log('✅ Post criado:', newPost);

      console.log('✅ Post criado:', newPost);

      document.getElementById("publish-modal")?.classList.remove("active")
      document.getElementById("success-modal")?.classList.add("active")
    }
  })

  document.getElementById("success-ok")?.addEventListener("click", () => {
    window.location.href = "community.html"
  })
}

// ===== ACTIVITIES PAGE =====
// (mantive tudo igual)
function initActivitiesPage() {
  const submitBtn = document.getElementById("submit-activity-btn")
  if (!submitBtn) return

  // ====== Carregar pacientes reais no dropdown ======
  const dropdown = document.getElementById("activity-patient");
  const pacientesSalvos = JSON.parse(localStorage.getItem("listaPacientesProfissional") || "[]");

  if (dropdown && pacientesSalvos.length > 0) {
    dropdown.innerHTML = `<option value="">Selecione um paciente</option>` +
      pacientesSalvos
        .map(p => `<option value="${p._id}" data-name="${p.nomeCompleto}">${p.nomeCompleto}</option>`)
        .join("");
  }


  renderActivitiesList()

  submitBtn.addEventListener("click", () => {
    document.getElementById("activity-confirm-modal")?.classList.add("active")
  })

  document.getElementById("confirm-activity")?.addEventListener("click", () => {
    const patient = document.getElementById("activity-patient")?.value
    const title = document.getElementById("activity-title")?.value
    const description = document.getElementById("activity-description")?.value
    const deadline = document.getElementById("activity-deadline")?.value

    if (patient && title && description && deadline) {
      const activities = DataManager.getActivities()
      const select = document.getElementById("activity-patient");
      const selectedName = select.options[select.selectedIndex].text;

      activities.push({
        id: Date.now(),
        patient,          // agora é o _id real
        patientName: selectedName, // nome real vindo da API
        title,
        description,
        deadline,
        status: "pending",
        response: null,
      });

      DataManager.saveActivities(activities)
      renderActivitiesList()

      document.getElementById("activity-confirm-modal")?.classList.remove("active")
      document.getElementById("activity-success-modal")?.classList.add("active")
    }
  })

  document.getElementById("activity-success-ok")?.addEventListener("click", () => {
    document.getElementById("activity-success-modal")?.classList.remove("active")
    document.getElementById("activity-patient").value = ""
    document.getElementById("activity-title").value = ""
    document.getElementById("activity-description").value = ""
    document.getElementById("activity-deadline").value = ""
  })

  document.getElementById("close-activity-details")?.addEventListener("click", () => {
    document.getElementById("activity-details-modal")?.classList.remove("active")
  })

  document.getElementById("close-details-ok")?.addEventListener("click", () => {
    document.getElementById("activity-details-modal")?.classList.remove("active")
  })
}

function renderActivitiesList() {
  const container = document.getElementById("activities-list")
  if (!container) return

  const activities = DataManager.getActivities()

  if (activities.length === 0) {
    container.innerHTML = '<p class="no-data-text">Nenhuma atividade criada ainda</p>'
    return
  }

  container.innerHTML = activities
    .map(
      (act) => `
    <div class="activity-card-item" data-activity-id="${act.id}">
      <div style="font-weight: 600; margin-bottom: 4px;">${act.title}</div>
      <div style="font-size: 15px; color: #6d523f; margin-bottom: 4px;">${act.patientName}</div>
      <div style="font-size: 14px; color: #4f3422;">
        <span style="display: inline-block; padding: 4px 12px; background: ${act.status === "completed" ? "#c8daa3" : "#e8dfd3"}; border-radius: 12px; margin-top: 8px;">
          ${act.status === "completed" ? "Concluída" : "Pendente"}
        </span>
      </div>
    </div>
  `
    )
    .join("")

  container.querySelectorAll(".activity-card-item").forEach((card) => {
    card.addEventListener("click", () => {
      const activityId = Number.parseInt(card.dataset.activityId)
      showActivityDetails(activityId)
    })
  })
}

function showActivityDetails(activityId) {
  const activities = DataManager.getActivities()
  const activity = activities.find((act) => act.id === activityId)

  if (!activity) return

  const modal = document.getElementById("activity-details-modal")
  const titleEl = document.getElementById("activity-detail-title")
  const contentEl = document.getElementById("activity-detail-content")

  titleEl.textContent = activity.title

  contentEl.innerHTML = `
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 18px; color: #4f3422;">Paciente:</strong>
      <p style="font-size: 16px; color: #6d523f; margin-top: 8px;">${activity.patientName}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 18px; color: #4f3422;">Descrição:</strong>
      <p style="font-size: 16px; color: #6d523f; margin-top: 8px;">${activity.description}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 18px; color: #4f3422;">Prazo:</strong>
      <p style="font-size: 16px; color: #6d523f; margin-top: 8px;">${new Date(activity.deadline).toLocaleDateString("pt-BR")}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 18px; color: #4f3422;">Status:</strong>
      <p style="font-size: 16px; color: #6d523f; margin-top: 8px;">${activity.status === "completed" ? "Concluída" : "Pendente"}</p>
    </div>
    ${activity.response
      ? `
      <div style="margin-top: 20px; padding: 16px; background: #faf5f1; border-radius: 12px;">
        <strong style="font-size: 18px; color: #4f3422;">Resposta do Paciente:</strong>
        <p style="font-size: 16px; color: #6d523f; margin-top: 8px;">${activity.response}</p>
      </div>
    `
      : ""
    }
  `

  modal.classList.add("active")
}

// ===== SETTINGS PAGE =====
function initSettingsPage() {
  const editInfoBtn = document.querySelector(".settings-link")
  if (!editInfoBtn) return

  editInfoBtn.addEventListener("click", () => {
    const modal = document.createElement("div")
    modal.className = "modal active"
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">Editar Informações</h3>
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" id="edit-name" class="form-input" value="${DataManager.getDoctorInfo().name}">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input type="email" id="edit-email" class="form-input" value="${DataManager.getDoctorInfo().email}">
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove()">Cancelar</button>
          <button class="modal-btn modal-btn-primary" id="confirm-edit-info">Salvar</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    modal.querySelector("#confirm-edit-info").addEventListener("click", () => {
      const confirmModal = document.createElement("div")
      confirmModal.className = "modal active"
      confirmModal.innerHTML = `
        <div class="modal-content">
          <h3 class="modal-title">Confirmar alterações</h3>
          <p class="modal-text">Tem certeza que deseja salvar as alterações?</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove()">Cancelar</button>
            <button class="modal-btn modal-btn-primary" id="final-confirm">Salvar</button>
          </div>
        </div>
      `
      document.body.appendChild(confirmModal)

      confirmModal.querySelector("#final-confirm").addEventListener("click", () => {
        const name = document.getElementById("edit-name").value
        const email = document.getElementById("edit-email").value
        DataManager.saveDoctorInfo({ name, email })

        // Update displayed info
        document.querySelector(".settings-value").textContent = `E-mail: ${email}`

        modal.remove()
        confirmModal.remove()
      })
    })
  })
}

// ===== MODALS =====
function initModals() {
  // Contact request modal
  const contactModal = document.getElementById("contact-request-modal")
  document.getElementById("decline-contact")?.addEventListener("click", () => {
    DataManager.clearContactRequests()
    document.getElementById("contact-dot").style.display = "none"
    contactModal?.classList.remove("active")
  })

  document.getElementById("accept-contact")?.addEventListener("click", () => {
    DataManager.clearContactRequests()
    document.getElementById("contact-dot").style.display = "none"
    contactModal?.classList.remove("active")
  })

  // Task notification modal
  const taskModal = document.getElementById("task-notification-modal")
  document.getElementById("cancel-task")?.addEventListener("click", () => {
    DataManager.clearTaskNotifications()
    document.getElementById("tasks-dot").style.display = "none"
    taskModal?.classList.remove("active")
  })

  document.getElementById("view-task")?.addEventListener("click", () => {
    DataManager.clearTaskNotifications()
    document.getElementById("tasks-dot").style.display = "none"
    window.location.href = "stats.html"
  })

  // Close modals on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })

  // Close modal buttons
  document.querySelectorAll(".close-modal-btn, .modal-btn-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal")?.classList.remove("active")
    })
  })

  const userName = localStorage.getItem('platformUserName') || "Profissional";

  document.querySelector('.greeting-text').innerHTML = `
  Olá, Dr(a) ${userName}
  <img class="wave" src="assets/ola-dr.png" alt="Saudação" style="width:50px; margin-left:6px;">
`;

}

// ===== FUNÇÃO DE API =====

async function carregarPacientesDoProfissional() {
  const token = localStorage.getItem("token");
  const profissionalId = localStorage.getItem("userId");

  if (!token || !profissionalId) {
    console.error("❌ Token ou userId não encontrados no localStorage.");
    return;
  }

  console.log("🔍 Buscando pacientes...");
  console.log("👤 Profissional ID:", profissionalId);
  console.log("🔑 Token:", token);

  try {
    const response = await fetch(
      `https://auratccbackend.onrender.com/api/profissionais/${profissionalId}/pacientes`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    console.log("📥 RESPOSTA DA API:", data);
    // salvar pacientes no localStorage para uso em outras páginas
    localStorage.setItem("listaPacientesProfissional", JSON.stringify(data));

    if (!response.ok) {
      console.error("❌ Erro ao buscar pacientes:", data);
      return;
    }

    // preencher tabela com retry caso tbody ainda não exista por algum motivo
    preencherTabelaPacientesWithRetry(data);

  } catch (error) {
    console.error("❌ Erro ao conectar com o servidor:", error);
  }
}

/**
 * Preencher tabela com retry simples (até 5 tentativas a cada 150ms).
 * Isso evita erro caso o DOM ainda não tenha o tbody por timing peculiar.
 */
function preencherTabelaPacientesWithRetry(pacientes, attempt = 0) {
  const tbody = document.getElementById("patients-tbody");
  if (tbody) {
    preencherTabelaPacientes(pacientes);
    return;
  }
  if (attempt >= 5) {
    console.error("❌ Não encontrei o tbody (#patients-tbody) após várias tentativas.");
    return;
  }
  setTimeout(() => preencherTabelaPacientesWithRetry(pacientes, attempt + 1), 150);
}

function preencherTabelaPacientes(pacientes) {
  const tbody = document.getElementById("patients-tbody");

  if (!tbody) {
    console.error("❌ Não encontrei o tbody da tabela (#patients-tbody).");
    return;
  }

  if (!pacientes || pacientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:20px;">
          Nenhum paciente encontrado.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pacientes
    .map(p => `
    <tr data-id="${p._id}">
      <td class="patient-name">${p.nomeCompleto}</td>
      <td class="patient-email">${p.email || "-"}</td>
      <td class="patient-cpf">${p.cpf || "-"}</td>

      <td class="patient-actions">

        <!-- BOTÃO VER DETALHES -->
        <button class="action-btn" title="Ver detalhes"
          onclick="window.location.href='patient-detail.html?id=${p._id}'">
          <img src="assets/arrow-diagonal.svg" />
        </button>

        <!-- BOTÃO DELETAR -->
        <button class="action-btn delete-patient" title="Excluir">
          <img src="assets/icon-delete.svg" width="20" height="20" />
        </button>

      </td>
    </tr>
  `)
    .join("");

  // ADICIONA EVENTO PARA EXCLUSÃO
  document.querySelectorAll(".delete-patient").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();

      const row = e.target.closest("tr");
      const patientId = row.getAttribute("data-id");

      const modal = document.getElementById("delete-patient-modal");
      modal.classList.add("active");

      document.getElementById("confirm-delete-patient").onclick = () => {
        row.remove();
        modal.classList.remove("active");
      };

      document.getElementById("cancel-delete-patient").onclick = () => {
        modal.classList.remove("active");
      };
    });
  });

}
// ================================
// SOLICITAÇÕES DE CONTATO — VERSÃO CORRETA PARA HOME
// ================================
async function carregarSolicitacoesContato() {
  const psicologoId = localStorage.getItem("platformUserId");
  const token = localStorage.getItem("token");

  if (!psicologoId || !token) {
    console.log("⛔ Psicólogo não logado");
    return;
  }

  try {
    const res = await fetch(`https://auratccbackend.onrender.com/api/profissionais/${psicologoId}/solicitacoes`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const solicitacoes = await res.json();
    console.log("📥 Solicitações recebidas:", solicitacoes);

    const dot = document.getElementById("contact-dot");

    if (dot) dot.style.display = solicitacoes.length > 0 ? "block" : "none";

    window.solicitacoesPendentes = solicitacoes;

  } catch (error) {
    console.error("❌ Erro ao carregar solicitações:", error);
  }
}

// abrir o modal ao clicar no card
document.getElementById("contact-requests-card")?.addEventListener("click", () => {
  if (!window.solicitacoesPendentes || window.solicitacoesPendentes.length === 0) {
    alert("Nenhuma solicitação de contato pendente.");
    return;
  }

  const solicitacao = window.solicitacoesPendentes[0];
  const modal = document.getElementById("contact-request-modal");

  document.getElementById("contact-message").innerText =
    `${solicitacao.nomeCompleto} quer fazer contato com você`;

  modal.classList.add("show");
});

// aceitar / recusar
async function responderSolicitacao(acao) {
  const psicologoId = localStorage.getItem("platformUserId");
  const token = localStorage.getItem("token");

  const solicitacao = window.solicitacoesPendentes[0];
  const pacienteId = solicitacao._id;

  try {
    const res = await fetch(
      `https://auratccbackend.onrender.com/api/profissionais/${psicologoId}/solicitacoes/${pacienteId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ acao })
      }
    );

    const data = await res.json();
    console.log("📨 Resposta enviada:", data);

    alert(`Solicitação ${acao === "aceitar" ? "aceita" : "recusada"} com sucesso!`);

    await carregarSolicitacoesContato();

    document.getElementById("contact-request-modal").classList.remove("show");

  } catch (error) {
    console.error("Erro ao responder solicitação:", error);
    alert("Erro ao responder solicitação.");
  }
}

// botões
document.getElementById("accept-contact")?.addEventListener("click", () => responderSolicitacao("aceitar"));
document.getElementById("decline-contact")?.addEventListener("click", () => responderSolicitacao("recusar"));

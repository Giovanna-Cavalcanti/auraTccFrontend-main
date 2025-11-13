// ===== DATA MANAGEMENT WITH LOCALSTORAGE =====
const DataManager = {
  // Initialize default data
  init() {
    if (!localStorage.getItem("appointments")) {
      const today = new Date()
      const todayStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`

      this.saveAppointments([
        {
          id: Date.now() + 1,
          date: todayStr,
          time: "09:00",
          patient: "Mariana Menezes",
          type: "online",
          status: "agendada",
          fullDate: today.toISOString(),
        },
        {
          id: Date.now() + 2,
          date: todayStr,
          time: "14:00",
          patient: "Wesley Oliveira",
          type: "presencial",
          status: "agendada",
          fullDate: today.toISOString(),
        },
      ])
    }

    if (!localStorage.getItem("posts")) {
      this.savePosts([])
    }

    if (!localStorage.getItem("activities")) {
      this.saveActivities([
        {
          id: 1,
          patient: "mariana",
          patientName: "Mariana Menezes",
          title: "Exercício de Respiração",
          description: "Pratique técnicas de respiração profunda por 10 minutos diariamente",
          deadline: "2025-04-15",
          status: "completed",
          response: "Concluí o exercício todos os dias. Me senti muito mais calma!",
        },
      ])
    }

    if (!localStorage.getItem("analyses")) {
      this.saveAnalyses({
        mariana: [
          {
            date: "10/03/2025",
            text: "Primeira sessão de terapia. Paciente apresentou queixa de ansiedade e dificuldades de organização no trabalho.",
          },
          {
            date: "17/03/2025",
            text: "O paciente relata leve melhora no gerenciamento de tempo, porém continua apresentando episódios de ansiedade intensa.",
          },
        ],
      })
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
  initPatientsPage()
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

  const posts = DataManager.getPosts()

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
        // Add new patient row to table
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
            <button class="action-btn" title="Ver detalhes" onclick="window.location.href='patient-detail.html'">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14 10L18 14L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 14H10C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="action-btn delete-patient" title="Excluir">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5M9 9V14M11 9V14M5 5L6 17C6 17.5523 6.44772 18 7 18H13C13.5523 18 14 17.5523 14 17L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="action-btn" title="Editar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </td>
        `
        tbody.appendChild(newRow)

        // Clear inputs
        document.getElementById("new-patient-name").value = ""
        document.getElementById("new-patient-email").value = ""
        document.getElementById("new-patient-phone").value = ""

        // Add delete listener to the new row
        newRow.querySelector(".delete-patient").addEventListener("click", (e) => {
          e.stopPropagation() // Prevent triggering the "View details" or "Edit" button
          const rowToDelete = e.target.closest("tr")
          const modal = document.getElementById("delete-patient-modal")
          modal.classList.add("active")

          document.getElementById("confirm-delete-patient").onclick = () => {
            rowToDelete.remove()
            modal.classList.remove("active")
          }
        })
      }

      document.getElementById("confirm-add-patient-modal")?.classList.remove("active")
    })

    document.getElementById("close-add-patient")?.addEventListener("click", () => {
      document.getElementById("add-patient-modal")?.classList.remove("active")
    })

    document.getElementById("cancel-add-patient")?.addEventListener("click", () => {
      document.getElementById("add-patient-modal")?.classList.remove("active")
    })

    document.getElementById("cancel-confirm-patient")?.addEventListener("click", () => {
      document.getElementById("confirm-add-patient-modal")?.classList.remove("active")
    })
  }

  // ---- Deletar paciente com modal e persistência ----
const tbody = document.getElementById("patients-tbody");
const deleteModal = document.getElementById("delete-patient-modal");
let patientToDelete = null;

// Carregar pacientes salvos
let savedPatients = JSON.parse(localStorage.getItem("patients") || "[]");

// Remover pacientes salvos da tabela
if (savedPatients.length > 0) {
  Array.from(tbody.rows).forEach(row => {
    const id = row.getAttribute("data-id");
    if (savedPatients.includes(id)) {
      row.remove();
    }
  });
}

// Detectar clique na lixeira
tbody.querySelectorAll(".delete-patient").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    patientToDelete = e.target.closest("tr");
    deleteModal.classList.add("active");
  });
});

// Cancelar exclusão
document.getElementById("cancel-delete-patient")?.addEventListener("click", () => {
  deleteModal.classList.remove("active");
  patientToDelete = null;
});

// Confirmar exclusão e salvar no localStorage
document.getElementById("confirm-delete-patient")?.addEventListener("click", () => {
  if (patientToDelete) {
    const id = patientToDelete.getAttribute("data-id");
    patientToDelete.remove();
    savedPatients.push(id);
    localStorage.setItem("patients", JSON.stringify(savedPatients));
    patientToDelete = null;
  }
  deleteModal.classList.remove("active");
});

}

function filterPatients(term) {
  const rows = document.querySelectorAll("#patients-tbody tr")
  const searchTerm = term.toLowerCase()
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(searchTerm) ? "" : "none"
  })
}

// ===== PATIENT DETAIL PAGE =====
function initPatientDetailPage() {
  const patientDetailPage = document.querySelector(".container-patient-detail")
  if (!patientDetailPage) return

  document.getElementById("history-card")?.addEventListener("click", () => {
    const modal = document.getElementById("history-modal")
    const list = document.getElementById("history-list")

    const appointments = DataManager.getAppointments()
    const marianaAppts = appointments.filter((apt) => apt.patient === "Mariana Menezes")

    if (marianaAppts.length === 0) {
      list.innerHTML = '<p class="no-data-text">Este paciente ainda não tem consultas agendadas.</p>'
    } else {
      list.innerHTML = marianaAppts
        .map((apt) => {
          const statusClass =
            apt.status === "concluida"
              ? "status-completed"
              : apt.status === "cancelada"
                ? "status-cancelled"
                : "status-scheduled"
          const statusText = apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
          return `
          <div style="padding: 16px; background: #faf5f1; border-radius: 12px; margin-bottom: 12px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${apt.date} - ${apt.time}</div>
            <div style="font-size: 16px; color: #6d523f;">${apt.type === "online" ? "Online" : "Presencial"}</div>
            <span class="status-badge ${statusClass}" style="margin-top: 8px; display: inline-block;">${statusText}</span>
          </div>
        `
        })
        .join("")
    }

    modal.classList.add("active")
  })

  let analysisSelectionMode = false
  const selectedAnalyses = new Set()

  document.getElementById("open-analysis-btn")?.addEventListener("click", () => {
    const modal = document.getElementById("analysis-modal")
    analysisSelectionMode = false
    selectedAnalyses.clear()
    renderAnalyses()
    modal.classList.add("active")
  })

  document.getElementById("add-analysis-btn")?.addEventListener("click", () => {
    if (analysisSelectionMode) {
      // Toggle to delete mode
      analysisSelectionMode = false
      selectedAnalyses.clear()
      renderAnalyses()
    } else {
      // Add new analysis
      document.getElementById("add-analysis-modal")?.classList.add("active")
    }
  })

  document.getElementById("delete-analysis-btn")?.addEventListener("click", () => {
    if (selectedAnalyses.size > 0) {
      document.getElementById("delete-analysis-modal")?.classList.add("active")
    }
  })

  document.getElementById("confirm-delete-analysis")?.addEventListener("click", () => {
    const analyses = DataManager.getAnalyses()
    if (analyses.mariana) {
      analyses.mariana = analyses.mariana.filter((_, index) => !selectedAnalyses.has(index))
      DataManager.saveAnalyses(analyses)
    }
    selectedAnalyses.clear()
    analysisSelectionMode = false
    renderAnalyses()
    document.getElementById("delete-analysis-modal")?.classList.remove("active")
  })

  document.getElementById("cancel-delete-analysis")?.addEventListener("click", () => {
    document.getElementById("delete-analysis-modal")?.classList.remove("active")
  })

  function renderAnalyses() {
    const container = document.getElementById("analysis-entries")
    const deleteBtn = document.getElementById("delete-analysis-btn")
    const addBtn = document.getElementById("add-analysis-btn")

    if (!container) return

    const analyses = DataManager.getAnalyses()
    const marianaAnalyses = analyses.mariana || []

    if (addBtn) {
      addBtn.textContent = analysisSelectionMode ? "Cancelar" : "+ Adicionar uma nova anotação"
    }

    if (deleteBtn) {
      deleteBtn.style.display = analysisSelectionMode && selectedAnalyses.size > 0 ? "block" : "none"
    }

    if (marianaAnalyses.length === 0) {
      container.innerHTML = '<p class="no-data-text">Não existem notas para este paciente</p>'
      if (deleteBtn) deleteBtn.style.display = "none"
      return
    }

    // Show delete button to enter selection mode
    const hasEntries = marianaAnalyses.length > 0
    if (hasEntries && !analysisSelectionMode) {
      container.innerHTML = marianaAnalyses
        .map(
          (analysis, index) => `
          <div class="analysis-entry">
            <p class="analysis-date">${analysis.date}</p>
            <p class="analysis-text">${analysis.text}</p>
          </div>
        `,
        )
        .join("")

      // Add button to enable selection mode
      container.innerHTML += `
        <button class="modal-btn modal-btn-secondary" id="enable-delete-mode" style="margin-top: 12px;">
          Excluir Anotações
        </button>
      `

      document.getElementById("enable-delete-mode")?.addEventListener("click", () => {
        analysisSelectionMode = true
        selectedAnalyses.clear()
        renderAnalyses()
      })
    } else if (analysisSelectionMode) {
      // Selection mode
      container.innerHTML = marianaAnalyses
        .map((analysis, index) => {
          const checked = selectedAnalyses.has(index) ? "checked" : ""
          return `
            <div class="analysis-entry selectable">
              <input type="checkbox" class="analysis-entry-checkbox" data-index="${index}" ${checked}>
              <p class="analysis-date">${analysis.date}</p>
              <p class="analysis-text">${analysis.text}</p>
            </div>
          `
        })
        .join("")

      // Add event listeners to checkboxes
      container.querySelectorAll(".analysis-entry-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const index = Number.parseInt(e.target.dataset.index)
          if (e.target.checked) {
            selectedAnalyses.add(index)
          } else {
            selectedAnalyses.delete(index)
          }
          if (deleteBtn) {
            deleteBtn.style.display = selectedAnalyses.size > 0 ? "block" : "none"
          }
        })
      })
    }
  }

  document.getElementById("save-analysis")?.addEventListener("click", () => {
    document.getElementById("add-analysis-modal")?.classList.remove("active")
    document.getElementById("save-analysis-confirm-modal")?.classList.add("active")
  })

  document.getElementById("confirm-save-analysis")?.addEventListener("click", () => {
    const text = document.getElementById("new-analysis-text")?.value
    if (text) {
      const analyses = DataManager.getAnalyses()
      if (!analyses.mariana) analyses.mariana = []

      const today = new Date()
      const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`

      analyses.mariana.push({ date: dateStr, text })
      DataManager.saveAnalyses(analyses)
      renderAnalyses()

      document.getElementById("new-analysis-text").value = ""
    }
    document.getElementById("save-analysis-confirm-modal")?.classList.remove("active")
    document.getElementById("analysis-modal")?.classList.add("active")
  })

  // Tasks modal
  document.getElementById("patient-tasks-card")?.addEventListener("click", () => {
    const modal = document.getElementById("patient-tasks-modal")
    const list = document.getElementById("patient-tasks-list")

    const activities = DataManager.getActivities()
    const marianaTasks = activities.filter((act) => act.patient === "mariana")

    if (marianaTasks.length === 0) {
      list.innerHTML = '<p class="no-data-text">Este paciente ainda não tem tarefas atribuídas.</p>'
    } else {
      list.innerHTML = marianaTasks
        .map(
          (task) => `
        <div style="padding: 20px; background: #faf5f1; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 20px; font-weight: 700; color: #4f3422; margin-bottom: 8px;">${task.title}</h4>
          <p style="font-size: 16px; color: #6d523f; margin-bottom: 12px;">${task.description}</p>
          <div style="font-size: 15px; color: #4f3422;"><strong>Prazo:</strong> ${new Date(task.deadline).toLocaleDateString("pt-BR")}</div>
          <div style="font-size: 15px; color: #4f3422; margin-top: 4px;"><strong>Status:</strong> ${task.status === "completed" ? "Concluída" : "Pendente"}</div>
          ${task.response ? `<div style="margin-top: 12px; padding: 12px; background: #ffffff; border-radius: 8px;"><strong>Resposta:</strong><br/>${task.response}</div>` : ""}
        </div>
      `,
        )
        .join("")
    }

    modal.classList.add("active")
  })

  // Editable pontuário
  document.getElementById("edit-pontuario-btn")?.addEventListener("click", () => {
    document.querySelectorAll(".editable-text").forEach((el) => {
      el.contentEditable = "true"
      el.classList.add("editing")
    })
    document.getElementById("edit-pontuario-btn").style.display = "none"
    document.getElementById("save-pontuario-btn").style.display = "inline-block"
  })

  document.getElementById("save-pontuario-btn")?.addEventListener("click", () => {
    document.getElementById("save-pontuario-modal")?.classList.add("active")
  })

  document.getElementById("confirm-save-pontuario")?.addEventListener("click", () => {
    document.querySelectorAll(".editable-text").forEach((el) => {
      el.contentEditable = "false"
      el.classList.remove("editing")
    })
    document.getElementById("edit-pontuario-btn").style.display = "inline-block"
    document.getElementById("save-pontuario-btn").style.display = "none"
    document.getElementById("save-pontuario-modal")?.classList.remove("active")
  })
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
    const posts = DataManager.getPosts()
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
          ${
            selectionMode
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

// ===== CREATE POST PAGE =====
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

  // Image attachment
  document.querySelector('.post-icon-btn[title="Anexar"]')?.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        selectedImage = true // In a real app, you'd upload this
      }
    }
    input.click()
  })

  // Publish
  publishBtn.addEventListener("click", () => {
    document.getElementById("publish-modal")?.classList.add("active")
  })

  document.getElementById("confirm-publish")?.addEventListener("click", () => {
    const title = document.getElementById("post-title")?.value
    const content = document.getElementById("post-content")?.value

    if (title && content) {
      const posts = DataManager.getPosts()
      const today = new Date()
      posts.push({
        id: Date.now(),
        title,
        content,
        tags: selectedTags,
        image: selectedImage,
        date: `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`,
      })
      DataManager.savePosts(posts)

      document.getElementById("publish-modal")?.classList.remove("active")
      document.getElementById("success-modal")?.classList.add("active")
    }
  })

  document.getElementById("success-ok")?.addEventListener("click", () => {
    window.location.href = "index.html"
  })
}

// ===== ACTIVITIES PAGE =====
function initActivitiesPage() {
  const submitBtn = document.getElementById("submit-activity-btn")
  if (!submitBtn) return

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
      const patientNames = {
        mariana: "Mariana Menezes",
        wesley: "Wesley Oliveira",
        caetano: "Caetano Viana",
        luiz: "Luiz da Silva",
      }

      activities.push({
        id: Date.now(),
        patient,
        patientName: patientNames[patient],
        title,
        description,
        deadline,
        status: "pending",
        response: null,
      })

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
  `,
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
    ${
      activity.response
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
}

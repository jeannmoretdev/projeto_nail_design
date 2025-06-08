// Componente de Agenda usando FullCalendar
const AgendaComponent = {
    // Elementos DOM
    elements: {
        calendar: null,
        addAppointmentBtn: null,
        appointmentModal: null,
        closeModal: null,
        appointmentForm: null,
        cancelBtn: null
    },
    
    // Instância do calendário
    calendarInstance: null,
    
    // Estado do componente
    state: {
        currentAppointment: null,
        clients: [],
        services: []
    },
    
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template
            document.getElementById('agenda').innerHTML = agendaTemplate;
            
            // Inicializar elementos DOM após carregar o template
            this.initElements();
            
            // Carregar dados de clientes e serviços
            await this.loadClientsAndServices();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar o calendário
            this.initCalendar();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de agenda:', error);
            document.getElementById('agenda').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar o componente de agenda.</p>
                    <p>Detalhes: ${error.message}</p>
                </div>
            `;
            return false;
        }
    },
    
    // Inicializar referências aos elementos DOM
    initElements: function() {
        this.elements = {
            calendar: document.getElementById('calendar'),
            addAppointmentBtn: document.getElementById('add-appointment-btn'),
            appointmentModal: document.getElementById('appointment-modal'),
            closeModal: document.querySelector('#appointment-modal .close-modal'),
            appointmentForm: document.getElementById('appointment-form'),
            cancelBtn: document.querySelector('#appointment-modal .btn-cancel'),
            clientSelect: document.getElementById('appointment-client'),
            serviceSelect: document.getElementById('appointment-service'),
            priceInput: document.getElementById('appointment-price')
        };
        
        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`Elemento '${key}' não encontrado no DOM`);
            }
        }
    },
    
    // Carregar dados de clientes e serviços
    loadClientsAndServices: async function() {
        try {
            // Carregar clientes
            const clients = await DB.clients.getAll();
            this.state.clients = clients;
            
            // Preencher select de clientes
            if (this.elements.clientSelect) {
                // Limpar opções existentes
                this.elements.clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
                
                // Adicionar clientes
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name;
                    this.elements.clientSelect.appendChild(option);
                });
            }
            
            // Carregar serviços
            const services = await DB.services.getAll();
            this.state.services = services;
            
            // Preencher select de serviços
            if (this.elements.serviceSelect) {
                // Limpar opções existentes
                this.elements.serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
                
                // Adicionar serviços
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.id;
                    option.textContent = service.name;
                    if (service.price) {
                        option.textContent += ` - R$ ${service.price.toFixed(2).replace('.', ',')}`;
                    }
                    this.elements.serviceSelect.appendChild(option);
                });
                
                // Adicionar evento para atualizar preço ao selecionar serviço
                this.elements.serviceSelect.addEventListener('change', () => {
                    const serviceId = parseInt(this.elements.serviceSelect.value);
                    if (serviceId) {
                        const service = services.find(s => s.id === serviceId);
                        if (service && service.price && this.elements.priceInput) {
                            this.elements.priceInput.value = service.price.toFixed(2).replace('.', ',');
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        }
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        const self = this;
        
        // Botão de adicionar compromisso
        if (this.elements.addAppointmentBtn) {
            this.elements.addAppointmentBtn.addEventListener('click', () => {
                this.openAppointmentModal();
            });
        }
        
        // Fechar modal
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => {
                this.elements.appointmentModal.style.display = 'none';
            });
        }
        
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', () => {
                this.elements.appointmentModal.style.display = 'none';
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            if (this.elements.appointmentModal && event.target === this.elements.appointmentModal) {
                this.elements.appointmentModal.style.display = 'none';
            }
        });
        
        // Formatar entrada de preço
        if (this.elements.priceInput) {
            this.elements.priceInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Converter para formato de moeda (R$)
                if (value) {
                    // Converter para centavos
                    value = parseInt(value, 10);
                    
                    // Formatar como moeda
                    value = (value / 100).toFixed(2);
                    
                    // Substituir ponto por vírgula
                    value = value.replace('.', ',');
                }
                
                e.target.value = value;
            });
        }
        
        // Salvar compromisso
        if (this.elements.appointmentForm) {
            this.elements.appointmentForm.addEventListener('submit', function(event) {
                event.preventDefault();
                self.saveAppointment();
            });
        }
    },
    
    // Inicializar o calendário
    initCalendar: function() {
        if (!this.elements.calendar) {
            console.error('Elemento do calendário não encontrado');
            return;
        }
        
        const self = this;
        
        // Criar instância do calendário
        this.calendarInstance = new FullCalendar.Calendar(this.elements.calendar, {
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            locale: 'pt-br',
            timeZone: 'local',
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            allDaySlot: false,
            slotMinTime: '07:00:00',
            slotMaxTime: '22:00:00',
            height: 'auto',
            expandRows: true,
            stickyHeaderDates: true,
            nowIndicator: true,
            businessHours: {
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Domingo a sábado
                startTime: '08:00',
                endTime: '20:00',
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            },
            slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
                hour12: false
            },
            views: {
                timeGrid: {
                    dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'numeric' }
                }
            },
            // Eventos de interação
            select: function(info) {
                self.openAppointmentModal(info.start, info.end);
            },
            eventClick: function(info) {
                self.openAppointmentModal(null, null, info.event.id);
            },
            eventDidMount: function(info) {
                // Adicionar classe de status ao evento
                const status = info.event.extendedProps.status || 'agendado';
                info.el.classList.add(`status-${status}`);
                
                // Criar tooltip simples sem depender de métodos adicionais
                try {
                    // Criar conteúdo do tooltip diretamente
                    let tooltipContent = `<div class="event-tooltip-title">${info.event.title}</div>`;
                    
                    // Adicionar horário
                    if (info.event.start && info.event.end) {
                        const startTime = info.event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        const endTime = info.event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        tooltipContent += `<div class="event-tooltip-time">${startTime} - ${endTime}</div>`;
                    }
                    
                    // Adicionar informações extras
                    const props = info.event.extendedProps || {};
                    
                    if (props.clientName) {
                        tooltipContent += `<div class="event-tooltip-client"><i class="fas fa-user"></i> ${props.clientName}</div>`;
                    }
                    
                    if (props.serviceName) {
                        tooltipContent += `<div class="event-tooltip-service"><i class="fas fa-tag"></i> ${props.serviceName}</div>`;
                    }
                    
                    if (props.price) {
                        const formattedPrice = typeof props.price === 'number' 
                            ? `R$ ${props.price.toFixed(2).replace('.', ',')}`
                            : props.price;
                        tooltipContent += `<div class="event-tooltip-price"><i class="fas fa-dollar-sign"></i> ${formattedPrice}</div>`;
                    }
                    
                    if (props.location) {
                        const locationText = props.location === 'salao' ? 'Salão' : 'Domicílio';
                        tooltipContent += `<div class="event-tooltip-location"><i class="fas fa-map-marker-alt"></i> ${locationText}</div>`;
                    }
                    
                    if (props.status) {
                        let statusText, statusIcon;
                        switch (props.status) {
                            case 'agendado':
                                statusText = 'Agendado';
                                statusIcon = 'calendar-check';
                                break;
                            case 'concluido':
                                statusText = 'Concluído';
                                statusIcon = 'check-circle';
                                break;
                            case 'cancelado':
                                statusText = 'Cancelado';
                                statusIcon = 'times-circle';
                                break;
                            default:
                                statusText = props.status;
                                statusIcon = 'info-circle';
                        }
                        tooltipContent += `<div class="event-tooltip-status"><i class="fas fa-${statusIcon}"></i> ${statusText}</div>`;
                    }
                    
                    // Usar o tooltip do Bootstrap diretamente
                    info.el.setAttribute('data-bs-toggle', 'tooltip');
                    info.el.setAttribute('data-bs-html', 'true');
                    info.el.setAttribute('data-bs-placement', 'top');
                    info.el.setAttribute('title', tooltipContent);
                    
                    // Inicializar o tooltip
                    new bootstrap.Tooltip(info.el);
                } catch (error) {
                    console.warn('Erro ao criar tooltip:', error);
                    // Fallback para título simples
                    info.el.title = info.event.title;
                }
            },
            // Carregar eventos do banco de dados
            events: function(info, successCallback, failureCallback) {
                self.loadAppointments(info.start, info.end)
                    .then(events => successCallback(events))
                    .catch(error => {
                        console.error('Erro ao carregar compromissos:', error);
                        failureCallback(error);
                    });
            }
        });
        
        // Renderizar o calendário
        this.calendarInstance.render();
        
        // Aplicar tema personalizado
        this.applyCustomTheme();
    },
    
    // Aplicar tema personalizado ao calendário
    applyCustomTheme: function() {
        // Adicionar classes CSS personalizadas
        const calendarEl = this.elements.calendar;
        if (calendarEl) {
            calendarEl.classList.add('nail-design-calendar');
            
            // Verificar tema atual do aplicativo
            const isDarkTheme = document.body.classList.contains('theme-dark');
            if (isDarkTheme) {
                calendarEl.classList.add('fc-theme-dark');
            }
        }
    },
    
    // Carregar compromissos do banco de dados
    loadAppointments: async function(start, end) {
        try {
            // Converter para strings ISO para comparação
            const startStr = start.toISOString();
            const endStr = end.toISOString();
            
            // Buscar todos os compromissos
            const appointments = await DB.appointments.getAll();
            
            // Filtrar compromissos no intervalo de datas
            const filteredAppointments = appointments.filter(appointment => {
                return appointment.startDate <= endStr && appointment.endDate >= startStr;
            });
            
            // Converter para o formato do FullCalendar
            const events = await Promise.all(filteredAppointments.map(async appointment => {
                // Buscar informações do cliente
                let clientName = '';
                if (appointment.clientId) {
                    try {
                        const client = await DB.clients.getById(appointment.clientId);
                        if (client) {
                            clientName = client.name;
                        }
                    } catch (error) {
                        console.error('Erro ao buscar cliente:', error);
                    }
                }
                
                // Buscar informações do serviço
                let serviceName = '';
                if (appointment.serviceId) {
                    try {
                        const service = await DB.services.getById(appointment.serviceId);
                        if (service) {
                            serviceName = service.name;
                        }
                    } catch (error) {
                        console.error('Erro ao buscar serviço:', error);
                    }
                }
                
                // Definir cor com base no status
                let backgroundColor, borderColor, textColor;
                switch (appointment.status) {
                    case 'agendado':
                        backgroundColor = 'var(--primary-light)';
                        borderColor = 'var(--primary-color)';
                        textColor = 'var(--primary-dark)';
                        break;
                    case 'concluido':
                        backgroundColor = 'var(--success-light)';
                        borderColor = 'var(--success)';
                        textColor = 'var(--success-dark)';
                        break;
                    case 'cancelado':
                        backgroundColor = 'var(--error-light)';
                        borderColor = 'var(--error)';
                        textColor = 'var(--error-dark)';
                        break;
                    default:
                        backgroundColor = 'var(--primary-light)';
                        borderColor = 'var(--primary-color)';
                        textColor = 'var(--primary-dark)';
                }
                
                // Criar evento no formato do FullCalendar
                return {
                    id: appointment.id.toString(),
                    title: appointment.title,
                    start: appointment.startDate,
                    end: appointment.endDate,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    textColor: textColor,
                    extendedProps: {
                        clientId: appointment.clientId,
                        clientName: clientName,
                        serviceId: appointment.serviceId,
                        serviceName: serviceName,
                        price: appointment.price,
                        location: appointment.location,
                        status: appointment.status,
                        notes: appointment.notes
                    }
                };
            }));
            
            return events;
        } catch (error) {
            console.error('Erro ao carregar compromissos:', error);
            throw error;
        }
    },
    
    // Formatar tooltip de evento
    formatEventTooltip: function(event) {
        const props = event.extendedProps;
        const startTime = event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endTime = event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        let tooltipContent = `
            <div class="event-tooltip">
                <div class="event-tooltip-title">${event.title}</div>
                <div class="event-tooltip-time">${startTime} - ${endTime}</div>
        `;
        
        if (props.clientName) {
            tooltipContent += `<div class="event-tooltip-client"><i class="fas fa-user"></i> ${props.clientName}</div>`;
        }
        
        if (props.serviceName) {
            tooltipContent += `<div class="event-tooltip-service"><i class="fas fa-tag"></i> ${props.serviceName}</div>`;
        }
        
        if (props.price) {
            const formattedPrice = typeof props.price === 'number' 
                ? `R$ ${props.price.toFixed(2).replace('.', ',')}`
                : props.price;
            tooltipContent += `<div class="event-tooltip-price"><i class="fas fa-dollar-sign"></i> ${formattedPrice}</div>`;
        }
        
        if (props.location) {
            const locationText = props.location === 'salao' ? 'Salão' : 'Domicílio';
            tooltipContent += `<div class="event-tooltip-location"><i class="fas fa-map-marker-alt"></i> ${locationText}</div>`;
        }
        
        if (props.status) {
            let statusText, statusIcon;
            switch (props.status) {
                case 'agendado':
                    statusText = 'Agendado';
                    statusIcon = 'calendar-check';
                    break;
                case 'concluido':
                    statusText = 'Concluído';
                    statusIcon = 'check-circle';
                    break;
                case 'cancelado':
                    statusText = 'Cancelado';
                    statusIcon = 'times-circle';
                    break;
                default:
                    statusText = props.status;
                    statusIcon = 'info-circle';
            }
            tooltipContent += `<div class="event-tooltip-status"><i class="fas fa-${statusIcon}"></i> ${statusText}</div>`;
        }
        
        tooltipContent += '</div>';
        return tooltipContent;
    },
    
    // Abrir modal de compromisso
    openAppointmentModal: function(start = null, end = null, appointmentId = null) {
        // Resetar formulário
        this.elements.appointmentForm.reset();
        
        // Definir título do modal
        const modalTitle = document.getElementById('modal-title');
        
        if (appointmentId) {
            // Editar compromisso existente
            modalTitle.textContent = 'Editar Compromisso';
            this.loadAppointmentData(appointmentId);
        } else {
            // Novo compromisso
            modalTitle.textContent = 'Novo Compromisso';
            document.getElementById('appointment-id').value = '';
            
            // Preencher data e hora se fornecidas
            if (start && end) {
                document.getElementById('appointment-date').value = this.formatDateForInput(start);
                document.getElementById('appointment-start-time').value = this.formatTimeForInput(start);
                document.getElementById('appointment-end-time').value = this.formatTimeForInput(end);
            } else {
                // Usar data e hora atuais
                const now = new Date();
                const endTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hora
                
                document.getElementById('appointment-date').value = this.formatDateForInput(now);
                document.getElementById('appointment-start-time').value = this.formatTimeForInput(now);
                document.getElementById('appointment-end-time').value = this.formatTimeForInput(endTime);
            }
            
            // Definir status padrão como 'agendado'
            document.getElementById('appointment-status').value = 'agendado';
        }
        
        // Mostrar modal
        this.elements.appointmentModal.style.display = 'block';
    },
    
    // Carregar dados de um compromisso existente
    loadAppointmentData: async function(appointmentId) {
        try {
            // Buscar compromisso no banco de dados
            const appointment = await DB.appointments.getById(parseInt(appointmentId));
            
            if (!appointment) {
                console.error('Compromisso não encontrado:', appointmentId);
                return;
            }
            
            // Armazenar compromisso atual
            this.state.currentAppointment = appointment;
            
            // Preencher formulário
            document.getElementById('appointment-id').value = appointment.id;
            document.getElementById('appointment-title').value = appointment.title || '';
            
            // Converter datas
            const startDate = new Date(appointment.startDate);
            const endDate = new Date(appointment.endDate);
            
            document.getElementById('appointment-date').value = this.formatDateForInput(startDate);
            document.getElementById('appointment-start-time').value = this.formatTimeForInput(startDate);
            document.getElementById('appointment-end-time').value = this.formatTimeForInput(endDate);
            
            // Selecionar cliente
            if (appointment.clientId && this.elements.clientSelect) {
                this.elements.clientSelect.value = appointment.clientId;
            }
            
            // Selecionar serviço
            if (appointment.serviceId && this.elements.serviceSelect) {
                this.elements.serviceSelect.value = appointment.serviceId;
            }
            
            // Preencher preço
            if (appointment.price !== undefined && appointment.price !== null && this.elements.priceInput) {
                if (typeof appointment.price === 'number') {
                    this.elements.priceInput.value = appointment.price.toFixed(2).replace('.', ',');
                } else {
                    this.elements.priceInput.value = appointment.price.toString().replace('.', ',');
                }
            }
            
            // Selecionar local
            if (appointment.location) {
                const locationRadios = document.getElementsByName('appointment-location');
                for (const radio of locationRadios) {
                    if (radio.value === appointment.location) {
                        radio.checked = true;
                        break;
                    }
                }
            }
            
            // Selecionar status
            if (appointment.status) {
                document.getElementById('appointment-status').value = appointment.status;
            }
            
            // Preencher observações
            document.getElementById('appointment-notes').value = appointment.notes || '';
        } catch (error) {
            console.error('Erro ao carregar dados do compromisso:', error);
            alert('Erro ao carregar dados do compromisso. Tente novamente.');
        }
    },
    
    // Salvar compromisso
    saveAppointment: async function() {
        try {
            // Obter dados do formulário
            const appointmentId = document.getElementById('appointment-id').value;
            const title = document.getElementById('appointment-title').value;
            const date = document.getElementById('appointment-date').value;
            const startTime = document.getElementById('appointment-start-time').value;
            const endTime = document.getElementById('appointment-end-time').value;
            const clientId = this.elements.clientSelect ? parseInt(this.elements.clientSelect.value) || null : null;
            const serviceId = this.elements.serviceSelect ? parseInt(this.elements.serviceSelect.value) || null : null;
            
            // Obter preço
            let price = null;
            if (this.elements.priceInput && this.elements.priceInput.value) {
                price = parseFloat(this.elements.priceInput.value.replace(',', '.'));
            }
            
            // Obter local
            let location = 'salao'; // Valor padrão
            const locationRadios = document.getElementsByName('appointment-location');
            for (const radio of locationRadios) {
                if (radio.checked) {
                    location = radio.value;
                    break;
                }
            }
            
            // Obter status
            const status = document.getElementById('appointment-status').value;
            
            // Obter observações
            const notes = document.getElementById('appointment-notes').value;
            
            // Validar dados
            if (!title) {
                alert('Por favor, informe o título do compromisso.');
                return;
            }
            
            if (!date || !startTime || !endTime) {
                alert('Por favor, informe a data e horários do compromisso.');
                return;
            }
            
            // Criar objetos de data
            const startDate = new Date(`${date}T${startTime}`);
            const endDate = new Date(`${date}T${endTime}`);
            
            // Verificar se a data de término é posterior à de início
            if (endDate <= startDate) {
                alert('O horário de término deve ser posterior ao horário de início.');
                return;
            }
            
            // Criar objeto de compromisso
            const appointment = {
                title: title,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                clientId: clientId,
                serviceId: serviceId,
                price: price,
                location: location,
                status: status,
                notes: notes
            };
            
            // Verificar sobreposição de compromissos
            const allAppointments = await DB.appointments.getAll();
            const overlappingAppointments = this.checkAppointmentOverlap(
                allAppointments, 
                appointment, 
                appointmentId ? parseInt(appointmentId) : null
            );
            
            if (overlappingAppointments.length > 0) {
                const confirmOverlap = confirm(`Existem ${overlappingAppointments.length} compromisso(s) agendados para este horário. Deseja continuar mesmo assim?`);
                if (!confirmOverlap) {
                    return;
                }
            }
            
            if (appointmentId) {
                // Atualizar compromisso existente
                appointment.id = parseInt(appointmentId);
                await DB.appointments.update(appointment);
            } else {
                // Adicionar novo compromisso
                await DB.appointments.add(appointment);
            }
            
            // Fechar modal
            this.elements.appointmentModal.style.display = 'none';
            
            // Atualizar calendário
            this.calendarInstance.refetchEvents();
            
        } catch (error) {
            console.error('Erro ao salvar compromisso:', error);
            alert('Erro ao salvar compromisso. Tente novamente.');
        }
    },
    
    // Verificar sobreposição de compromissos
    checkAppointmentOverlap: function(appointments, newAppointment, excludeId = null) {
        const newStart = new Date(newAppointment.startDate);
        const newEnd = new Date(newAppointment.endDate);
        
        return appointments.filter(appointment => {
            // Ignorar o próprio compromisso em caso de edição
            if (excludeId && appointment.id === excludeId) {
                return false;
            }
            
            const start = new Date(appointment.startDate);
            const end = new Date(appointment.endDate);
            
            // Verificar se há sobreposição
            // (newStart < end) && (newEnd > start)
            return newStart < end && newEnd > start;
        });
    },
    
    // Formatar data para input type="date"
    formatDateForInput: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Formatar hora para input type="time"
    formatTimeForInput: function(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
};
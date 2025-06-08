// Componente de Agenda
const AgendaComponent = {
    // Elementos DOM
    elements: {
        addAppointmentBtn: null,
        appointmentModal: null,
        closeModal: null,
        appointmentForm: null,
        cancelBtn: null,
        prevPeriodBtn: null,
        nextPeriodBtn: null,
        todayBtn: null,
        currentPeriodLabel: null,
        dayViewBtn: null,
        weekViewBtn: null,
        monthViewBtn: null,
        agendaContainer: null,
        dateFilterInput: null,
        dateFilterBtn: null
    },
    
    // Estado do componente
    state: {
        currentDate: new Date(),
        currentView: 'week',
        appointments: []
    },
    
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template
            document.getElementById('agenda').innerHTML = agendaTemplate;
            
            // Inicializar elementos DOM
            this.initElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Carregar compromissos e renderizar a visualização
            await this.loadAppointments();
            this.renderView();
            
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
            addAppointmentBtn: document.getElementById('add-appointment-btn'),
            appointmentModal: document.getElementById('appointment-modal'),
            closeModal: document.querySelector('#appointment-modal .close-modal'),
            appointmentForm: document.getElementById('appointment-form'),
            cancelBtn: document.querySelector('#appointment-modal .btn-cancel'),
            prevPeriodBtn: document.getElementById('prev-period-btn'),
            nextPeriodBtn: document.getElementById('next-period-btn'),
            todayBtn: document.getElementById('today-btn'),
            currentPeriodLabel: document.getElementById('current-period'),
            dayViewBtn: document.getElementById('day-view-btn'),
            weekViewBtn: document.getElementById('week-view-btn'),
            monthViewBtn: document.getElementById('month-view-btn'),
            agendaContainer: document.getElementById('agenda-container'),
            dateFilterInput: document.getElementById('date-filter-input'),
            dateFilterBtn: document.getElementById('date-filter-btn')
        };
        
        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`Elemento '${key}' não encontrado no DOM`);
            }
        }
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        const self = this;
        
        // Botão para adicionar compromisso
        if (this.elements.addAppointmentBtn) {
            this.elements.addAppointmentBtn.addEventListener('click', () => {
                this.showAppointmentModal();
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
            if (event.target === this.elements.appointmentModal) {
                this.elements.appointmentModal.style.display = 'none';
            }
        });
        
        // Navegação de período
        if (this.elements.prevPeriodBtn) {
            this.elements.prevPeriodBtn.addEventListener('click', () => {
                this.navigateToPreviousPeriod();
            });
        }
        
        if (this.elements.nextPeriodBtn) {
            this.elements.nextPeriodBtn.addEventListener('click', () => {
                this.navigateToNextPeriod();
            });
        }
        
        if (this.elements.todayBtn) {
            this.elements.todayBtn.addEventListener('click', () => {
                this.navigateToToday();
            });
        }
        
        // Mudança de visualização
        if (this.elements.dayViewBtn) {
            this.elements.dayViewBtn.addEventListener('click', () => {
                this.changeView('day');
            });
        }
        
        if (this.elements.weekViewBtn) {
            this.elements.weekViewBtn.addEventListener('click', () => {
                this.changeView('week');
            });
        }
        
        if (this.elements.monthViewBtn) {
            this.elements.monthViewBtn.addEventListener('click', () => {
                this.changeView('month');
            });
        }
        
        // Filtro de data
        if (this.elements.dateFilterBtn) {
            this.elements.dateFilterBtn.addEventListener('click', () => {
                const dateValue = this.elements.dateFilterInput.value;
                if (dateValue) {
                    const selectedDate = new Date(dateValue);
                    this.state.currentDate = selectedDate;
                    this.loadAppointments().then(() => {
                        this.renderView();
                    });
                }
            });
        }
        
        // Atualizar horário final ao selecionar serviço
        const serviceSelect = document.getElementById('appointment-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', function() {
                if (this.value) {
                    self.updatePriceFromService(this.value);
                    self.updateEndTimeFromService(this.value);
                }
            });
        }
        
        // Salvar compromisso
        if (this.elements.appointmentForm) {
            this.elements.appointmentForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const appointmentId = document.getElementById('appointment-id').value;
                const title = document.getElementById('appointment-title').value;
                const date = document.getElementById('appointment-date').value;
                const startTime = document.getElementById('appointment-start-time').value;
                const endTime = document.getElementById('appointment-end-time').value;
                
                // Criar datas de início e fim
                const startDate = new Date(`${date}T${startTime}`);
                const endDate = new Date(`${date}T${endTime}`);
                
                // Validar datas
                if (endDate <= startDate) {
                    alert('O horário final deve ser posterior ao horário inicial.');
                    return;
                }
                
                // Obter cliente e serviço
                const clientId = document.getElementById('appointment-client').value || null;
                const serviceId = document.getElementById('appointment-service').value || null;
                
                // Obter preço
                let price = document.getElementById('appointment-price').value;
                if (price) {
                    price = parseFloat(price.replace(',', '.'));
                } else {
                    price = 0;
                }
                
                // Obter local
                let location = 'salao';
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
                const notes = document.getElementById('appointment-notes').value || '';
                
                // Criar objeto do compromisso
                const appointment = {
                    title,
                    startDate,
                    endDate,
                    clientId,
                    serviceId,
                    price,
                    location,
                    status,
                    notes
                };
                
                if (appointmentId) {
                    // Atualizar compromisso existente
                    appointment.id = parseInt(appointmentId);
                    DB.appointments.update(appointment)
                        .then(() => {
                            self.loadAppointments().then(() => {
                                self.renderView();
                                self.elements.appointmentModal.style.display = 'none';
                            });
                        })
                        .catch(error => {
                            console.error('Erro ao atualizar compromisso:', error);
                            alert('Erro ao atualizar compromisso. Tente novamente.');
                        });
                } else {
                    // Adicionar novo compromisso
                    DB.appointments.add(appointment)
                        .then(() => {
                            self.loadAppointments().then(() => {
                                self.renderView();
                                self.elements.appointmentModal.style.display = 'none';
                            });
                        })
                        .catch(error => {
                            console.error('Erro ao adicionar compromisso:', error);
                            alert('Erro ao adicionar compromisso. Tente novamente.');
                        });
                }
            });
        }
    },
    
    // Mostrar modal para adicionar/editar compromisso
    showAppointmentModal: function(startDate = null) {
        // Resetar formulário
        this.elements.appointmentForm.reset();
        document.getElementById('appointment-id').value = '';
        
        // Definir título do modal
        document.getElementById('modal-title').textContent = 'Novo Compromisso';
        
        // Preencher data e hora se fornecidas
        if (startDate) {
            document.getElementById('appointment-date').value = this.formatDateForInput(startDate);
            document.getElementById('appointment-start-time').value = this.formatTimeForInput(startDate);
            
            // Definir horário final como 1 hora depois
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            document.getElementById('appointment-end-time').value = this.formatTimeForInput(endDate);
        } else {
            // Usar data e hora atuais
            const now = new Date();
            document.getElementById('appointment-date').value = this.formatDateForInput(now);
            
            // Arredondar para a próxima hora
            const nextHour = new Date(now);
            nextHour.setHours(nextHour.getHours() + 1);
            nextHour.setMinutes(0);
            nextHour.setSeconds(0);
            
            document.getElementById('appointment-start-time').value = this.formatTimeForInput(nextHour);
            
            // Definir horário final como 1 hora depois
            const endTime = new Date(nextHour);
            endTime.setHours(endTime.getHours() + 1);
            document.getElementById('appointment-end-time').value = this.formatTimeForInput(endTime);
        }
        
        // Carregar clientes e serviços
        this.loadClientsForSelect();
        this.loadServicesForSelect();
        
        // Mostrar modal
        this.elements.appointmentModal.style.display = 'block';
    },
    
    // Atualizar horário final com base no serviço selecionado
    updateEndTimeFromService: function(serviceId) {
        DB.services.getById(parseInt(serviceId))
            .then(service => {
                if (service) {
                    // Obter horário inicial
                    const startTimeInput = document.getElementById('appointment-start-time');
                    const dateInput = document.getElementById('appointment-date');
                    const endTimeInput = document.getElementById('appointment-end-time');
                    
                    if (startTimeInput.value && dateInput.value) {
                        // Criar data de início
                        const startDate = new Date(`${dateInput.value}T${startTimeInput.value}`);
                        
                        // Estimar duração com base no preço (regra simples: 15 min por cada R$ 25)
                        let durationMinutes = 60; // Padrão: 1 hora
                        
                        if (service.price) {
                            // Mínimo de 30 minutos, máximo de 3 horas
                            durationMinutes = Math.min(180, Math.max(30, Math.round(service.price / 25) * 15));
                        }
                        
                        // Calcular horário final
                        const endDate = new Date(startDate);
                        endDate.setMinutes(endDate.getMinutes() + durationMinutes);
                        
                        // Atualizar campo de horário final
                        endTimeInput.value = this.formatTimeForInput(endDate);
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao carregar serviço:', error);
            });
    },
    
    // Carregar compromissos
    loadAppointments: async function() {
        try {
            // Determinar o intervalo de datas com base na visualização atual
            let startDate, endDate;
            
            switch (this.state.currentView) {
                case 'day':
                    // Para visualização diária, carregar apenas o dia atual
                    startDate = new Date(this.state.currentDate);
                    startDate.setHours(0, 0, 0, 0);
                    
                    endDate = new Date(this.state.currentDate);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                    
                case 'week':
                    // Para visualização semanal, carregar a semana inteira
                    startDate = this.getStartOfWeek(this.state.currentDate);
                    endDate = this.getEndOfWeek(this.state.currentDate);
                    break;
                    
                case 'month':
                    // Para visualização mensal, carregar o mês inteiro
                    startDate = this.getStartOfMonth(this.state.currentDate);
                    endDate = this.getEndOfMonth(this.state.currentDate);
                    break;
                    
                default:
                    // Padrão: carregar a semana atual
                    startDate = this.getStartOfWeek(this.state.currentDate);
                    endDate = this.getEndOfWeek(this.state.currentDate);
            }
            
            // Carregar compromissos do banco de dados
            const appointments = await DB.appointments.getByDateRange(startDate, endDate);
            
            // Atualizar estado
            this.state.appointments = appointments;
            
            return appointments;
        } catch (error) {
            console.error('Erro ao carregar compromissos:', error);
            throw error;
        }
    },
    
    // Renderizar a visualização atual
    renderView: function() {
        if (!this.elements.agendaContainer) {
            console.error('Container da agenda não encontrado');
            return;
        }
        
        // Atualizar o título do período
        this.updatePeriodTitle();
        
        // Limpar o container
        this.elements.agendaContainer.innerHTML = '';
        
        // Renderizar a visualização apropriada
        switch (this.state.currentView) {
            case 'day':
                this.renderDayView();
                break;
                
            case 'week':
                this.renderWeekView();
                break;
                
            case 'month':
                this.renderMonthView();
                break;
                
            default:
                this.renderWeekView();
        }
    },
    
    // Atualizar o título do período
    updatePeriodTitle: function() {
        if (!this.elements.currentPeriodLabel) {
            return;
        }
        
        const currentDate = this.state.currentDate;
        let title = '';
        
        switch (this.state.currentView) {
            case 'day':
                // Formato: "Segunda-feira, 10 de Julho de 2023"
                title = currentDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                // Capitalizar primeira letra
                title = title.charAt(0).toUpperCase() + title.slice(1);
                break;
                
            case 'week':
                // Formato: "10 - 16 de Julho, 2023"
                const startOfWeek = this.getStartOfWeek(currentDate);
                const endOfWeek = this.getEndOfWeek(currentDate);
                
                // Se o mês for o mesmo
                if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                    title = `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('pt-BR', { month: 'long' })}, ${startOfWeek.getFullYear()}`;
                } else {
                    // Se forem meses diferentes
                    title = `${startOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('pt-BR', { month: 'long' })}, ${startOfWeek.getFullYear()}`;
                }
                break;
                
            case 'month':
                // Formato: "Julho de 2023"
                title = currentDate.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                });
                // Capitalizar primeira letra
                title = title.charAt(0).toUpperCase() + title.slice(1);
                break;
        }
        
        this.elements.currentPeriodLabel.textContent = title;
    },
    
    // Renderizar visualização diária
    renderDayView: function() {
        const container = this.elements.agendaContainer;
        const currentDate = this.state.currentDate;
        const today = new Date();
        
        // Criar estrutura da visualização diária
        const dayView = document.createElement('div');
        dayView.className = 'day-view';
        
        // Coluna de horas
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        
        // Adicionar horas (7h às 22h)
        for (let hour = 7; hour <= 22; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour}:00`;
            timeColumn.appendChild(timeSlot);
        }
        
        // Coluna do dia
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // Cabeçalho do dia
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        // Verificar se é hoje
        if (this.isSameDay(currentDate, today)) {
            dayHeader.classList.add('today');
        }
        
        // Número do dia
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = currentDate.getDate();
        
        // Informações da data
        const dateInfo = document.createElement('div');
        dateInfo.className = 'date-info';
        
        const weekday = document.createElement('div');
        weekday.className = 'weekday';
        weekday.textContent = currentDate.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        const month = document.createElement('div');
        month.className = 'month';
        month.textContent = currentDate.toLocaleDateString('pt-BR', { month: 'short' });
        
        dateInfo.appendChild(weekday);
        dateInfo.appendChild(month);
        
        dayHeader.appendChild(dateNumber);
        dayHeader.appendChild(dateInfo);
        
        // Grade do dia
        const dayGrid = document.createElement('div');
        dayGrid.className = 'day-grid';
        
        // Adicionar linhas de hora
        for (let hour = 7; hour <= 22; hour++) {
            const hourLine = document.createElement('div');
            hourLine.className = 'hour-line';
            hourLine.style.top = `${(hour - 7) * 60}px`;
            dayGrid.appendChild(hourLine);
        }
        
        // Adicionar linha de hora atual se for hoje
        if (this.isSameDay(currentDate, today)) {
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();
            
            if (currentHour >= 7 && currentHour < 22) {
                const currentTimeLine = document.createElement('div');
                currentTimeLine.className = 'current-time-line';
                currentTimeLine.style.top = `${(currentHour - 7) * 60 + currentMinute}px`;
                
                const currentTimeMarker = document.createElement('div');
                currentTimeMarker.className = 'current-time-marker';
                
                currentTimeLine.appendChild(currentTimeMarker);
                dayGrid.appendChild(currentTimeLine);
            }
        }
        
        // Adicionar compromissos
        this.renderAppointmentsForDay(dayGrid, currentDate);
        
        // Montar a estrutura
        dayColumn.appendChild(dayHeader);
        dayColumn.appendChild(dayGrid);
        
        // Adicionar evento de clique para adicionar compromisso
        dayGrid.addEventListener('click', (event) => {
            // Calcular a hora com base na posição do clique
            const rect = dayGrid.getBoundingClientRect();
            const y = event.clientY - rect.top;
            
            // Converter para hora (7h às 22h)
            const hour = Math.floor(y / 60) + 7;
            const minute = Math.round((y % 60) / 15) * 15; // Arredondar para intervalos de 15 minutos
            
            // Criar data para o compromisso
            const appointmentDate = new Date(currentDate);
            appointmentDate.setHours(hour, minute, 0, 0);
            
            // Mostrar modal para adicionar compromisso
            this.showAppointmentModal(appointmentDate);
        });
        
        dayView.appendChild(timeColumn);
        dayView.appendChild(dayColumn);
        
        container.appendChild(dayView);
    },
    
    // Renderizar compromissos para um dia específico
    renderAppointmentsForDay: function(container, date) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = this.state.appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            return this.isSameDay(appointmentDate, date);
        });
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => {
            return new Date(a.startDate) - new Date(b.startDate);
        });
        
        // Adicionar compromissos à grade
        dayAppointments.forEach(appointment => {
            const startDate = new Date(appointment.startDate);
            const endDate = new Date(appointment.endDate);
            
            // Verificar se o compromisso está dentro do horário visível (7h às 22h)
            if (startDate.getHours() >= 7 && startDate.getHours() < 22) {
                const appointmentElement = document.createElement('div');
                appointmentElement.className = `appointment status-${appointment.status}`;
                appointmentElement.dataset.id = appointment.id;
                
                // Calcular posição e altura
                const startMinutes = (startDate.getHours() - 7) * 60 + startDate.getMinutes();
                const endMinutes = Math.min((endDate.getHours() - 7) * 60 + endDate.getMinutes(), (22 - 7) * 60);
                const height = endMinutes - startMinutes;
                
                appointmentElement.style.top = `${startMinutes}px`;
                appointmentElement.style.height = `${height}px`;
                
                // Formatar horário
                const startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                // Preencher conteúdo
                appointmentElement.innerHTML = `
                    <div class="appointment-time">${startTimeStr} - ${endTimeStr}</div>
                    <div class="appointment-title">${appointment.title}</div>
                `;
                
                // Adicionar informações do cliente se disponível
                if (appointment.clientId) {
                    DB.clients.getById(appointment.clientId)
                        .then(client => {
                            if (client) {
                                const clientElement = document.createElement('div');
                                clientElement.className = 'appointment-client';
                                clientElement.textContent = client.name;
                                appointmentElement.appendChild(clientElement);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao carregar cliente:', error);
                        });
                }
                
                // Adicionar evento de clique para mostrar detalhes
                appointmentElement.addEventListener('click', (event) => {
                    event.stopPropagation(); // Evitar que o clique se propague para a grade
                    this.showAppointmentDetails(appointment.id);
                });
                
                container.appendChild(appointmentElement);
            }
        });
    },
    
    // Renderizar visualização semanal
    renderWeekView: function() {
        const container = this.elements.agendaContainer;
        const currentDate = this.state.currentDate;
        
        // Obter o primeiro dia da semana (domingo)
        const startOfWeek = this.getStartOfWeek(currentDate);
        
        // Criar estrutura da visualização semanal
        const weekView = document.createElement('div');
        weekView.className = 'week-view';
        
        // Coluna de horas
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        
        // Adicionar horas (7h às 22h)
        for (let hour = 7; hour <= 22; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour}:00`;
            timeColumn.appendChild(timeSlot);
        }
        
        // Colunas dos dias
        const dayColumns = document.createElement('div');
        dayColumns.className = 'day-columns';
        
        // Adicionar colunas para cada dia da semana
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(dayDate.getDate() + i);
            
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            
            // Cabeçalho do dia
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            
            // Verificar se é hoje
            if (this.isSameDay(dayDate, today)) {
                dayHeader.classList.add('today');
            }
            
            // Número do dia
            const dateNumber = document.createElement('div');
            dateNumber.className = 'date-number';
            dateNumber.textContent = dayDate.getDate();
            
            // Informações da data
            const dateInfo = document.createElement('div');
            dateInfo.className = 'date-info';
            
            const weekday = document.createElement('div');
            weekday.className = 'weekday';
            weekday.textContent = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' });
            
            const month = document.createElement('div');
            month.className = 'month';
            month.textContent = dayDate.toLocaleDateString('pt-BR', { month: 'short' });
            
            dateInfo.appendChild(weekday);
            dateInfo.appendChild(month);
            
            dayHeader.appendChild(dateNumber);
            dayHeader.appendChild(dateInfo);
            
            // Grade do dia
            const dayGrid = document.createElement('div');
            dayGrid.className = 'day-grid';
            
            // Adicionar linhas de hora
            for (let hour = 7; hour <= 22; hour++) {
                const hourLine = document.createElement('div');
                hourLine.className = 'hour-line';
                hourLine.style.top = `${(hour - 7) * 60}px`;
                dayGrid.appendChild(hourLine);
            }
            
            // Adicionar linha de hora atual se for hoje
            if (this.isSameDay(dayDate, today)) {
                const currentHour = today.getHours();
                const currentMinute = today.getMinutes();
                
                if (currentHour >= 7 && currentHour < 22) {
                    const currentTimeLine = document.createElement('div');
                    currentTimeLine.className = 'current-time-line';
                    currentTimeLine.style.top = `${(currentHour - 7) * 60 + currentMinute}px`;
                    
                    const currentTimeMarker = document.createElement('div');
                    currentTimeMarker.className = 'current-time-marker';
                    
                    currentTimeLine.appendChild(currentTimeMarker);
                    dayGrid.appendChild(currentTimeLine);
                }
            }
            
            // Adicionar compromissos
            this.renderAppointmentsForDay(dayGrid, dayDate);
            
            // Montar a estrutura
            dayColumn.appendChild(dayHeader);
            dayColumn.appendChild(dayGrid);
            
            // Adicionar evento de clique para adicionar compromisso
            dayGrid.addEventListener('click', (event) => {
                // Calcular a hora com base na posição do clique
                const rect = dayGrid.getBoundingClientRect();
                const y = event.clientY - rect.top;
                
                // Converter para hora (7h às 22h)
                const hour = Math.floor(y / 60) + 7;
                const minute = Math.round((y % 60) / 15) * 15; // Arredondar para intervalos de 15 minutos
                
                // Criar data para o compromisso
                const appointmentDate = new Date(dayDate);
                appointmentDate.setHours(hour, minute, 0, 0);
                
                // Mostrar modal para adicionar compromisso
                this.showAppointmentModal(appointmentDate);
            });
            
            dayColumns.appendChild(dayColumn);
        }
        
        weekView.appendChild(timeColumn);
        weekView.appendChild(dayColumns);
        
        container.appendChild(weekView);
    },
    
    // Renderizar visualização mensal
    renderMonthView: function() {
        const container = this.elements.agendaContainer;
        const currentDate = this.state.currentDate;
        
        // Obter o primeiro dia do mês
        const firstDayOfMonth = this.getStartOfMonth(currentDate);
        
        // Obter o último dia do mês
        const lastDayOfMonth = this.getEndOfMonth(currentDate);
        
        // Obter o primeiro dia da grade (pode ser do mês anterior)
        const firstDayOfGrid = new Date(firstDayOfMonth);
        firstDayOfGrid.setDate(firstDayOfGrid.getDate() - firstDayOfMonth.getDay());
        
        // Criar estrutura da visualização mensal
        const monthView = document.createElement('div');
        monthView.className = 'month-view';
        
        // Cabeçalho com os dias da semana
        const weekdays = document.createElement('div');
        weekdays.className = 'weekdays';
        
        const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekdayNames.forEach(name => {
            const weekday = document.createElement('div');
            weekday.className = 'weekday';
            weekday.textContent = name;
            weekdays.appendChild(weekday);
        });
        
        // Grade de dias
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        
        // Criar células para cada dia (6 semanas x 7 dias)
        const today = new Date();
        const currentDay = new Date(firstDayOfGrid);
        
        for (let i = 0; i < 42; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            
            // Verificar se o dia é do mês atual
            const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
            if (!isCurrentMonth) {
                dayCell.classList.add('other-month');
            }
            
            // Verificar se é hoje
            if (this.isSameDay(currentDay, today)) {
                dayCell.classList.add('today');
            }
            
            // Número do dia
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDay.getDate();
            
            // Container para compromissos
            const dayAppointments = document.createElement('div');
            dayAppointments.className = 'day-appointments';
            
            // Adicionar compromissos
            this.renderAppointmentsForMonthDay(dayAppointments, currentDay);
            
            dayCell.appendChild(dayNumber);
            dayCell.appendChild(dayAppointments);
            
            // Adicionar evento de clique para adicionar compromisso
            dayCell.addEventListener('click', () => {
                // Criar data para o compromisso (meio-dia)
                const appointmentDate = new Date(currentDay);
                appointmentDate.setHours(12, 0, 0, 0);
                
                // Mostrar modal para adicionar compromisso
                this.showAppointmentModal(appointmentDate);
            });
            
            daysGrid.appendChild(dayCell);
            
            // Avançar para o próximo dia
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        monthView.appendChild(weekdays);
        monthView.appendChild(daysGrid);
        
        container.appendChild(monthView);
    },
    
    // Renderizar compromissos para um dia na visualização mensal
    renderAppointmentsForMonthDay: function(container, date) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = this.state.appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            return this.isSameDay(appointmentDate, date);
        });
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => {
            return new Date(a.startDate) - new Date(b.startDate);
        });
        
        // Limitar a 3 compromissos visíveis
        const visibleAppointments = dayAppointments.slice(0, 3);
        const hiddenCount = dayAppointments.length - visibleAppointments.length;
        
        // Adicionar compromissos visíveis
        visibleAppointments.forEach(appointment => {
            const appointmentElement = document.createElement('div');
            appointmentElement.className = `appointment-mini status-${appointment.status}`;
            appointmentElement.dataset.id = appointment.id;
            
            // Formatar horário
            const startDate = new Date(appointment.startDate);
            const startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Preencher conteúdo
            appointmentElement.innerHTML = `
                <span class="appointment-time">${startTimeStr}</span>
                <span class="appointment-title">${appointment.title}</span>
            `;
            
            // Adicionar evento de clique para mostrar detalhes
            appointmentElement.addEventListener('click', (event) => {
                event.stopPropagation(); // Evitar que o clique se propague para a célula do dia
                this.showAppointmentDetails(appointment.id);
            });
            
            container.appendChild(appointmentElement);
        });
        
        // Adicionar indicador de "mais compromissos" se necessário
        if (hiddenCount > 0) {
            const moreElement = document.createElement('div');
            moreElement.className = 'more-events';
            moreElement.textContent = `+ ${hiddenCount} mais`;
            
            // Adicionar evento de clique para mostrar todos os compromissos do dia
            moreElement.addEventListener('click', (event) => {
                event.stopPropagation(); // Evitar que o clique se propague para a célula do dia
                this.showDayAppointments(date);
            });
            
            container.appendChild(moreElement);
        }
    },
    
    // Mostrar detalhes de um compromisso
    showAppointmentDetails: function(appointmentId) {
        DB.appointments.getById(appointmentId)
            .then(appointment => {
                if (!appointment) {
                    console.error('Compromisso não encontrado:', appointmentId);
                    return;
                }
                
                // Verificar se já existe um modal de detalhes e removê-lo
                const existingModal = document.querySelector('.appointment-details-modal');
                if (existingModal) {
                    existingModal.remove();
                }
                
                // Criar modal de detalhes
                const detailsModal = document.createElement('div');
                detailsModal.className = 'appointment-details-modal';
                
                // Formatar datas
                const startDate = new Date(appointment.startDate);
                const endDate = new Date(appointment.endDate);
                
                const dateStr = startDate.toLocaleDateString('pt-BR');
                const startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                // Formatar preço
                const formattedPrice = appointment.price ? 
                    `R$ ${appointment.price.toFixed(2).replace('.', ',')}` : 'Não informado';
                
                // Formatar status
                let statusText = 'Agendado';
                if (appointment.status === 'concluido') {
                    statusText = 'Concluído';
                } else if (appointment.status === 'cancelado') {
                    statusText = 'Cancelado';
                }
                
                // Formatar local
                let locationText = 'Salão';
                if (appointment.location === 'cliente') {
                    locationText = 'Casa do Cliente';
                } else if (appointment.location === 'outro') {
                    locationText = 'Outro Local';
                }
                
                // Preencher conteúdo básico
                detailsModal.innerHTML = `
                    <div class="appointment-title">${appointment.title}</div>
                    <div class="appointment-time">${dateStr} | ${startTimeStr} - ${endTimeStr}</div>
                    <div class="appointment-info">
                        <div><strong>Status:</strong> ${statusText}</div>
                        <div><strong>Local:</strong> ${locationText}</div>
                        <div><strong>Preço:</strong> ${formattedPrice}</div>
                    </div>
                `;
                
                // Adicionar cliente se existir
                if (appointment.clientId) {
                    DB.clients.getById(appointment.clientId)
                        .then(client => {
                            if (client) {
                                const clientElement = document.createElement('div');
                                clientElement.innerHTML = `<strong>Cliente:</strong> ${client.name}`;
                                
                                const infoElement = detailsModal.querySelector('.appointment-info');
                                infoElement.insertBefore(clientElement, infoElement.firstChild);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao carregar cliente:', error);
                        });
                }
                
                // Adicionar serviço se existir
                if (appointment.serviceId) {
                    DB.services.getById(appointment.serviceId)
                        .then(service => {
                            if (service) {
                                const serviceElement = document.createElement('div');
                                serviceElement.innerHTML = `<strong>Serviço:</strong> ${service.name}`;
                                
                                const infoElement = detailsModal.querySelector('.appointment-info');
                                
                                // Inserir após o cliente ou no início
                                const clientElement = infoElement.querySelector('div:first-child');
                                if (clientElement && clientElement.textContent.includes('Cliente:')) {
                                    infoElement.insertBefore(serviceElement, clientElement.nextSibling);
                                } else {
                                    infoElement.insertBefore(serviceElement, infoElement.firstChild);
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao carregar serviço:', error);
                        });
                }
                
                // Adicionar observações se existirem
                if (appointment.notes) {
                    const notesElement = document.createElement('div');
                    notesElement.className = 'appointment-notes';
                    notesElement.innerHTML = `
                        <strong>Observações:</strong>
                        <p>${appointment.notes}</p>
                    `;
                    
                    detailsModal.appendChild(notesElement);
                }
                
                // Adicionar botões de ação
                const actionsElement = document.createElement('div');
                actionsElement.className = 'appointment-actions';
                
                const editButton = document.createElement('button');
                editButton.className = 'edit-btn';
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => {
                    this.editAppointment(appointmentId);
                    detailsModal.remove();
                });
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Excluir';
                deleteButton.addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja excluir este compromisso?')) {
                        this.deleteAppointment(appointmentId);
                        detailsModal.remove();
                    }
                });
                
                actionsElement.appendChild(editButton);
                actionsElement.appendChild(deleteButton);
                
                detailsModal.appendChild(actionsElement);
                
                // Adicionar botão de fechar
                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-details-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', () => {
                    detailsModal.remove();
                });
                detailsModal.appendChild(closeBtn);
                
                // Adicionar ao DOM
                document.body.appendChild(detailsModal);
                
                // Posicionar o modal próximo ao elemento clicado
                const appointmentElement = document.querySelector(`.appointment[data-id="${appointmentId}"], .appointment-mini[data-id="${appointmentId}"]`);
                if (appointmentElement) {
                    const rect = appointmentElement.getBoundingClientRect();
                    
                    // Posicionar à direita do elemento, se possível
                    let left = rect.right + 10;
                    let top = rect.top;
                    
                    // Verificar se o modal ficaria fora da tela
                    const modalWidth = 350; // Largura aproximada do modal
                    if (left + modalWidth > window.innerWidth) {
                        // Posicionar à esquerda do elemento
                        left = rect.left - modalWidth - 10;
                        
                        // Se ainda ficar fora da tela, posicionar centralizado
                        if (left < 0) {
                            left = Math.max(10, (window.innerWidth - modalWidth) / 2);
                            top = rect.bottom + 10;
                        }
                    }
                    
                    // Verificar se o modal ficaria fora da tela verticalmente
                    const modalHeight = detailsModal.offsetHeight;
                    if (top + modalHeight > window.innerHeight) {
                        top = Math.max(10, window.innerHeight - modalHeight - 10);
                    }
                    
                    detailsModal.style.left = `${left}px`;
                    detailsModal.style.top = `${top}px`;
                } else {
                    // Se o elemento não for encontrado, centralizar o modal
                    const modalWidth = 350; // Largura aproximada do modal
                    const left = Math.max(10, (window.innerWidth - modalWidth) / 2);
                    const top = 100;
                    
                    detailsModal.style.left = `${left}px`;
                    detailsModal.style.top = `${top}px`;
                }
                
                // Fechar o modal ao clicar fora dele
                document.addEventListener('click', function closeModalOnClickOutside(event) {
                    if (!detailsModal.contains(event.target) && 
                        !event.target.closest('.appointment') && 
                        !event.target.closest('.appointment-mini')) {
                        detailsModal.remove();
                        document.removeEventListener('click', closeModalOnClickOutside);
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao carregar detalhes do compromisso:', error);
            });
    },
    
    // Mostrar todos os compromissos de um dia
    showDayAppointments: function(date) {
        this.state.currentDate = new Date(date);
        this.state.currentView = 'day';
        
        // Atualizar botões de visualização
        const viewButtons = [this.elements.dayViewBtn, this.elements.weekViewBtn, this.elements.monthViewBtn];
        viewButtons.forEach(button => {
            if (button) {
                button.classList.remove('active');
            }
        });
        
        if (this.elements.dayViewBtn) {
            this.elements.dayViewBtn.classList.add('active');
        }
        
        // Carregar compromissos e renderizar a visualização
        this.loadAppointments().then(() => {
            this.renderView();
        });
    },
    
    // Editar compromisso
    editAppointment: function(appointmentId) {
        DB.appointments.getById(appointmentId)
            .then(appointment => {
                if (!appointment) {
                    console.error('Compromisso não encontrado:', appointmentId);
                    return;
                }
                
                // Resetar formulário
                this.elements.appointmentForm.reset();
                
                // Definir título do modal
                document.getElementById('modal-title').textContent = 'Editar Compromisso';
                
                // Preencher campos do formulário
                document.getElementById('appointment-id').value = appointment.id;
                document.getElementById('appointment-title').value = appointment.title;
                
                // Formatar datas
                const startDate = new Date(appointment.startDate);
                const endDate = new Date(appointment.endDate);
                
                document.getElementById('appointment-date').value = this.formatDateForInput(startDate);
                document.getElementById('appointment-start-time').value = this.formatTimeForInput(startDate);
                document.getElementById('appointment-end-time').value = this.formatTimeForInput(endDate);
                
                // Carregar clientes e serviços
                this.loadClientsForSelect(appointment.clientId);
                this.loadServicesForSelect(appointment.serviceId);
                
                // Preencher preço
                if (appointment.price) {
                    document.getElementById('appointment-price').value = appointment.price.toFixed(2).replace('.', ',');
                } else {
                    document.getElementById('appointment-price').value = '';
                }
                
                // Selecionar local
                const locationRadios = document.getElementsByName('appointment-location');
                for (const radio of locationRadios) {
                    if (radio.value === appointment.location) {
                        radio.checked = true;
                        break;
                    }
                }
                
                // Selecionar status
                document.getElementById('appointment-status').value = appointment.status;
                
                // Preencher observações
                document.getElementById('appointment-notes').value = appointment.notes || '';
                
                // Mostrar modal
                this.elements.appointmentModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Erro ao carregar compromisso para edição:', error);
                alert('Erro ao carregar dados do compromisso. Tente novamente.');
            });
    },
    
    // Excluir compromisso
    deleteAppointment: function(appointmentId) {
        DB.appointments.delete(appointmentId)
            .then(() => {
                this.loadAppointments().then(() => {
                    this.renderView();
                });
            })
            .catch(error => {
                console.error('Erro ao excluir compromisso:', error);
                alert('Erro ao excluir compromisso. Tente novamente.');
            });
    },
    
    // Carregar clientes para o select
    loadClientsForSelect: function(selectedClientId = null) {
        const clientSelect = document.getElementById('appointment-client');
        if (!clientSelect) return;
        
        // Limpar opções existentes, mantendo apenas a primeira (Selecione um cliente)
        while (clientSelect.options.length > 1) {
            clientSelect.remove(1);
        }
        
        // Carregar clientes
        DB.clients.getAll()
            .then(clients => {
                // Ordenar clientes por nome
                clients.sort((a, b) => a.name.localeCompare(b.name));
                
                // Adicionar opções
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name;
                    
                    // Selecionar cliente se for o mesmo do compromisso
                    if (selectedClientId && client.id === selectedClientId) {
                        option.selected = true;
                    }
                    
                    clientSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar clientes:', error);
            });
    },
    
    // Carregar serviços para o select
    loadServicesForSelect: function(selectedServiceId = null) {
        const serviceSelect = document.getElementById('appointment-service');
        if (!serviceSelect) return;
        
        // Limpar opções existentes, mantendo apenas a primeira (Selecione um serviço)
        while (serviceSelect.options.length > 1) {
            serviceSelect.remove(1);
        }
        
        // Carregar serviços
        DB.services.getAll()
            .then(services => {
                // Agrupar serviços por categoria
                const servicesByCategory = {};
                
                services.forEach(service => {
                    const category = service.category || 'Sem Categoria';
                    
                    if (!servicesByCategory[category]) {
                        servicesByCategory[category] = [];
                    }
                    
                    servicesByCategory[category].push(service);
                });
                
                // Ordenar categorias
                const sortedCategories = Object.keys(servicesByCategory).sort();
                
                // Adicionar serviços agrupados por categoria
                sortedCategories.forEach(category => {
                    // Criar grupo de opções para a categoria
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = category;
                    
                    // Ordenar serviços por nome
                    const sortedServices = servicesByCategory[category].sort((a, b) => 
                        a.name.localeCompare(b.name)
                    );
                    
                    // Adicionar serviços ao grupo
                    sortedServices.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service.id;
                        
                        // Adicionar preço ao nome, se disponível
                        let displayName = service.name;
                        if (service.price) {
                            displayName += ` - R$ ${service.price.toFixed(2).replace('.', ',')}`;
                        }
                        
                        option.textContent = displayName;
                        
                        // Selecionar serviço se for o mesmo do compromisso
                        if (selectedServiceId && service.id === selectedServiceId) {
                            option.selected = true;
                        }
                        
                        optgroup.appendChild(option);
                    });
                    
                    serviceSelect.appendChild(optgroup);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar serviços:', error);
            });
    },
    
    // Atualizar preço com base no serviço selecionado
    updatePriceFromService: function(serviceId) {
        DB.services.getById(parseInt(serviceId))
            .then(service => {
                if (service && service.price) {
                    const priceInput = document.getElementById('appointment-price');
                    if (priceInput) {
                        priceInput.value = service.price.toFixed(2).replace('.', ',');
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao carregar preço do serviço:', error);
            });
    },
    
    // Navegar para o período anterior
    navigateToPreviousPeriod: function() {
        const currentDate = this.state.currentDate;
        
        switch (this.state.currentView) {
            case 'day':
                // Voltar um dia
                currentDate.setDate(currentDate.getDate() - 1);
                break;
                
            case 'week':
                // Voltar uma semana
                currentDate.setDate(currentDate.getDate() - 7);
                break;
                
            case 'month':
                // Voltar um mês
                currentDate.setMonth(currentDate.getMonth() - 1);
                break;
        }
        
        this.state.currentDate = new Date(currentDate);
        
        // Carregar compromissos e renderizar a visualização
        this.loadAppointments().then(() => {
            this.renderView();
        });
    },
    
    // Navegar para o próximo período
    navigateToNextPeriod: function() {
        const currentDate = this.state.currentDate;
        
        switch (this.state.currentView) {
            case 'day':
                // Avançar um dia
                currentDate.setDate(currentDate.getDate() + 1);
                break;
                
            case 'week':
                // Avançar uma semana
                currentDate.setDate(currentDate.getDate() + 7);
                break;
                
            case 'month':
                // Avançar um mês
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
        
        this.state.currentDate = new Date(currentDate);
        
        // Carregar compromissos e renderizar a visualização
        this.loadAppointments().then(() => {
            this.renderView();
        });
    },
    
    // Navegar para hoje
    navigateToToday: function() {
        this.state.currentDate = new Date();
        
        // Carregar compromissos e renderizar a visualização
        this.loadAppointments().then(() => {
            this.renderView();
        });
    },
    
    // Mudar visualização
    changeView: function(view) {
        if (!['day', 'week', 'month'].includes(view)) {
            console.error('Visualização inválida:', view);
            return;
        }
        
        this.state.currentView = view;
        
        // Atualizar botões de visualização
        const viewButtons = [this.elements.dayViewBtn, this.elements.weekViewBtn, this.elements.monthViewBtn];
        viewButtons.forEach(button => {
            if (button) {
                button.classList.remove('active');
            }
        });
        
        switch (view) {
            case 'day':
                if (this.elements.dayViewBtn) {
                    this.elements.dayViewBtn.classList.add('active');
                }
                break;
                
            case 'week':
                if (this.elements.weekViewBtn) {
                    this.elements.weekViewBtn.classList.add('active');
                }
                break;
                
            case 'month':
                if (this.elements.monthViewBtn) {
                    this.elements.monthViewBtn.classList.add('active');
                }
                break;
        }
        
        // Carregar compromissos e renderizar a visualização
        this.loadAppointments().then(() => {
            this.renderView();
        });
    },
    
    // Funções auxiliares
    
    // Verificar se duas datas são o mesmo dia
    isSameDay: function(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },
    
    // Obter o início da semana (domingo)
    getStartOfWeek: function(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    },
    
    // Obter o fim da semana (sábado)
    getEndOfWeek: function(date) {
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    },
    
    // Obter o início do mês
    getStartOfMonth: function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    
    // Obter o fim do mês
    getEndOfMonth: function(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    },
    
    // Formatar data para input (YYYY-MM-DD)
    formatDateForInput: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Formatar hora para input (HH:MM)
    formatTimeForInput: function(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
};
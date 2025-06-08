// Utilitários para o componente de Agenda
const AgendaUtils = {
    // ===== FUNÇÕES DE MANIPULAÇÃO DE DATAS =====
    
    // Verifica se duas datas são o mesmo dia
    isSameDay: function(date1, date2) {
        if (!date1 || !date2) return false;
        
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },
    
    // Obtém o primeiro dia da semana (domingo) para uma data
    getStartOfWeek: function(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = domingo, 1 = segunda, etc.
        
        // Voltar para o domingo
        d.setDate(d.getDate() - day);
        
        // Definir para o início do dia (00:00:00)
        d.setHours(0, 0, 0, 0);
        
        return d;
    },
    
    // Obtém o último dia da semana (sábado) para uma data
    getEndOfWeek: function(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = domingo, 1 = segunda, etc.
        
        // Avançar para o sábado
        d.setDate(d.getDate() + (6 - day));
        
        // Definir para o final do dia (23:59:59)
        d.setHours(23, 59, 59, 999);
        
        return d;
    },
    
    // Obtém o primeiro dia do mês
    getStartOfMonth: function(date) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    // Obtém o último dia do mês
    getEndOfMonth: function(date) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        d.setHours(23, 59, 59, 999);
        return d;
    },
    
    // Formata data para input HTML (YYYY-MM-DD)
    formatDateForInput: function(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },
    
    // Formata hora para input HTML (HH:MM)
    formatTimeForInput: function(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    },
    
    // ===== FUNÇÕES DE RENDERIZAÇÃO DE COMPROMISSOS =====
    
    // Renderiza compromissos para um dia específico
    renderAppointmentsForDay: function(appointments, date, container) {
        if (!container) return;
        
        // Limpar container
        container.innerHTML = '';
        
        // Filtrar compromissos para o dia
        const dayAppointments = appointments.filter(appointment => 
            this.isSameDay(appointment.startDate, date)
        );
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );
        
        // Se não houver compromissos, mostrar mensagem
        if (dayAppointments.length === 0) {
            container.innerHTML = '<p class="no-appointments">Nenhum compromisso para este dia</p>';
            return;
        }
        
        // Renderizar cada compromisso
        dayAppointments.forEach(appointment => {
            const appointmentEl = document.createElement('div');
            appointmentEl.className = `appointment status-${appointment.status || 'agendado'}`;
            appointmentEl.dataset.id = appointment.id;
            
            // Formatar horário
            const startTime = new Date(appointment.startDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const endTime = new Date(appointment.endDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Construir HTML do compromisso
            appointmentEl.innerHTML = `
                <div class="appointment-time">${startTime} - ${endTime}</div>
                <div class="appointment-details">
                    <div class="appointment-title">${appointment.title}</div>
                    ${appointment.clientName ? `<div class="appointment-client">${appointment.clientName}</div>` : ''}
                    ${appointment.serviceName ? `<div class="appointment-service">${appointment.serviceName}</div>` : ''}
                </div>
                <div class="appointment-actions">
                    <button class="edit-btn" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Adicionar ao container
            container.appendChild(appointmentEl);
            
            // Adicionar eventos
            const editBtn = appointmentEl.querySelector('.edit-btn');
            const deleteBtn = appointmentEl.querySelector('.delete-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    // Disparar evento personalizado para edição
                    const editEvent = new CustomEvent('edit-appointment', {
                        detail: { appointmentId: appointment.id }
                    });
                    document.dispatchEvent(editEvent);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    // Disparar evento personalizado para exclusão
                    const deleteEvent = new CustomEvent('delete-appointment', {
                        detail: { appointmentId: appointment.id }
                    });
                    document.dispatchEvent(deleteEvent);
                });
            }
            
            // Adicionar evento de clique para mostrar detalhes
            appointmentEl.addEventListener('click', () => {
                // Disparar evento personalizado para mostrar detalhes
                const showDetailsEvent = new CustomEvent('show-appointment-details', {
                    detail: { appointmentId: appointment.id }
                });
                document.dispatchEvent(showDetailsEvent);
            });
        });
    },
    
    // Renderiza versões mini dos compromissos (para visão mensal)
    renderMiniAppointmentsForDay: function(appointments, date, container, maxToShow = 3) {
        if (!container) return;
        
        // Limpar container
        container.innerHTML = '';
        
        // Filtrar compromissos para o dia
        const dayAppointments = appointments.filter(appointment => 
            this.isSameDay(appointment.startDate, date)
        );
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );
        
        // Se não houver compromissos, não mostrar nada
        if (dayAppointments.length === 0) {
            return;
        }
        
        // Determinar quantos compromissos mostrar
        const toShow = dayAppointments.slice(0, maxToShow);
        const remaining = dayAppointments.length - maxToShow;
        
        // Renderizar cada compromisso
        toShow.forEach(appointment => {
            const appointmentEl = document.createElement('div');
            appointmentEl.className = `mini-appointment status-${appointment.status || 'agendado'}`;
            appointmentEl.dataset.id = appointment.id;
            
            // Formatar horário
            const startTime = new Date(appointment.startDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Construir HTML do compromisso
            appointmentEl.innerHTML = `
                <span class="mini-time">${startTime}</span>
                <span class="mini-title">${appointment.title}</span>
            `;
            
            // Adicionar ao container
            container.appendChild(appointmentEl);
            
            // Adicionar evento de clique para mostrar detalhes
            appointmentEl.addEventListener('click', (event) => {
                event.stopPropagation();
                // Disparar evento personalizado para mostrar detalhes
                const showDetailsEvent = new CustomEvent('show-appointment-details', {
                    detail: { appointmentId: appointment.id }
                });
                document.dispatchEvent(showDetailsEvent);
            });
        });
        
        // Se houver mais compromissos, mostrar indicador
        if (remaining > 0) {
            const moreEl = document.createElement('div');
            moreEl.className = 'mini-more';
            moreEl.textContent = `+ ${remaining} mais`;
            
            // Adicionar ao container
            container.appendChild(moreEl);
            
            // Adicionar evento de clique para mostrar todos os compromissos do dia
            moreEl.addEventListener('click', (event) => {
                event.stopPropagation();
                // Disparar evento personalizado para mostrar todos os compromissos do dia
                const showDayEvent = new CustomEvent('show-day-appointments', {
                    detail: { date: date }
                });
                document.dispatchEvent(showDayEvent);
            });
        }
    },
    
    // Adiciona informações do cliente ao elemento de compromisso
    addClientInfoToAppointment: function(appointment, clientElement) {
        if (!appointment || !clientElement) return;
        
        // Se não tiver clientId, não fazer nada
        if (!appointment.clientId) return;
        
        // Buscar cliente no banco de dados
        DB.clients.getById(appointment.clientId)
            .then(client => {
                if (client) {
                    // Atualizar elemento com informações do cliente
                    clientElement.textContent = client.name;
                    clientElement.title = `Cliente: ${client.name}`;
                    
                    // Adicionar telefone se disponível
                    if (client.phone) {
                        const phoneEl = document.createElement('div');
                        phoneEl.className = 'client-phone';
                        phoneEl.innerHTML = `<i class="fas fa-phone"></i> ${client.phone}`;
                        clientElement.parentNode.appendChild(phoneEl);
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar cliente:', error);
            });
    },
    
    // ===== FUNÇÕES DE UI =====
    
    // Posiciona modal de detalhes
    positionDetailsModal: function(modal, eventElement) {
        if (!modal || !eventElement) return;
        
        const rect = eventElement.getBoundingClientRect();
        const modalContent = modal.querySelector('.modal-content');
        
        if (!modalContent) return;
        
        // Calcular posição
        const top = rect.bottom + window.scrollY + 10; // 10px abaixo do evento
        const left = rect.left + window.scrollX;
        
        // Verificar se o modal ficaria fora da tela
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = modalContent.offsetWidth;
        const modalHeight = modalContent.offsetHeight;
        
        // Ajustar posição horizontal se necessário
        let adjustedLeft = left;
        if (left + modalWidth > viewportWidth) {
            adjustedLeft = viewportWidth - modalWidth - 20; // 20px de margem
        }
        
        // Ajustar posição vertical se necessário
        let adjustedTop = top;
        if (top + modalHeight > viewportHeight + window.scrollY) {
            adjustedTop = rect.top + window.scrollY - modalHeight - 10; // 10px acima do evento
        }
        
        // Aplicar posição
        modalContent.style.position = 'absolute';
        modalContent.style.top = `${Math.max(20, adjustedTop)}px`;
        modalContent.style.left = `${Math.max(20, adjustedLeft)}px`;
        modalContent.style.transform = 'none';
    },
    
    // Formata período para exibição no cabeçalho
    formatPeriodHeader: function(startDate, endDate, view) {
        if (!startDate || !endDate) return '';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Formatar com base na visualização
        switch (view) {
            case 'day':
                return start.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            
            case 'week':
                const startDay = start.toLocaleDateString('pt-BR', {
                    day: 'numeric'
                });
                const startMonth = start.toLocaleDateString('pt-BR', {
                    month: 'short'
                });
                const endDay = end.toLocaleDateString('pt-BR', {
                    day: 'numeric'
                });
                const endMonth = end.toLocaleDateString('pt-BR', {
                    month: 'short'
                });
                const year = start.getFullYear();
                
                // Se for o mesmo mês
                if (start.getMonth() === end.getMonth()) {
                    return `${startDay} a ${endDay} de ${startMonth} de ${year}`;
                } else {
                    return `${startDay} de ${startMonth} a ${endDay} de ${endMonth} de ${year}`;
                }
            
            case 'month':
                return start.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                });
            
            default:
                return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
        }
    },
    
    // ===== FUNÇÕES DE VALIDAÇÃO E VERIFICAÇÃO =====
    
    // Valida formulário de compromisso
    validateAppointmentForm: function(formData) {
        const errors = [];
        
        // Validar título
        if (!formData.title || formData.title.trim() === '') {
            errors.push('O título é obrigatório');
        }
        
        // Validar datas
        if (!formData.startDate) {
            errors.push('A data de início é obrigatória');
        }
        
        if (!formData.startTime) {
            errors.push('A hora de início é obrigatória');
        }
        
        if (!formData.endTime) {
            errors.push('A hora de término é obrigatória');
        }
        
        // Verificar se a hora de término é posterior à hora de início
        if (formData.startDate && formData.startTime && formData.endTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);
            
            if (endDateTime <= startDateTime) {
                errors.push('A hora de término deve ser posterior à hora de início');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // Verifica sobreposição de compromissos
    checkAppointmentOverlap: function(appointments, newAppointment) {
        // Ignorar o próprio compromisso ao verificar sobreposições (para edição)
        const otherAppointments = appointments.filter(a => 
            a.id !== newAppointment.id
        );
        
        // Converter datas para objetos Date
        const newStart = new Date(newAppointment.startDate);
        const newEnd = new Date(newAppointment.endDate);
        
        // Verificar sobreposição com cada compromisso existente
        const overlappingAppointments = otherAppointments.filter(appointment => {
            const existingStart = new Date(appointment.startDate);
            const existingEnd = new Date(appointment.endDate);
            
            // Verificar se há sobreposição
            // (newStart < existingEnd) && (newEnd > existingStart)
            return newStart < existingEnd && newEnd > existingStart;
        });
        
        return {
            hasOverlap: overlappingAppointments.length > 0,
            overlappingAppointments: overlappingAppointments
        };
    },
    
    // ===== FUNÇÕES DE CÁLCULO E FORMATAÇÃO =====
    
    // Calcula duração entre duas datas em minutos
    calculateDurationInMinutes: function(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        
        // Converter para objetos Date se forem strings
        if (typeof startDate === 'string') startDate = new Date(startDate);
        if (typeof endDate === 'string') endDate = new Date(endDate);
        
        // Calcular diferença em milissegundos
        const diffMs = endDate - startDate;
        
        // Converter para minutos
        return Math.round(diffMs / 60000);
    },
    
    // Formata duração em horas e minutos
    formatDuration: function(minutes) {
        if (!minutes || minutes <= 0) return 'Não definida';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins} minuto${mins !== 1 ? 's' : ''}`;
        } else if (mins === 0) {
            return `${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
            return `${hours} hora${hours !== 1 ? 's' : ''} e ${mins} minuto${mins !== 1 ? 's' : ''}`;
        }
    },
    
    // Gera cores para categorias
    generateCategoryColors: function(categories) {
        const colors = {};
        
        // Cores predefinidas para categorias comuns
        const predefinedColors = {
            'Manicure': '#FF9AA2',
            'Pedicure': '#FFB7B2',
            'Alongamento': '#FFDAC1',
            'Esmaltação': '#E2F0CB',
            'Decoração': '#B5EAD7',
            'Tratamento': '#C7CEEA'
        };
        
        // Cores para gerar aleatoriamente
        const baseColors = [
            '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', 
            '#B5EAD7', '#C7CEEA', '#F2A2E8', '#BDB2FF',
            '#A2D2FF', '#FDFFB6', '#CAFFBF', '#9BF6FF'
        ];
        
        // Atribuir cores às categorias
        categories.forEach((category, index) => {
            if (predefinedColors[category]) {
                // Usar cor predefinida se disponível
                colors[category] = predefinedColors[category];
            } else {
                // Usar cor da lista ou gerar aleatoriamente
                const colorIndex = index % baseColors.length;
                colors[category] = baseColors[colorIndex];
            }
        });
        
        return colors;
    },
    
    // Calcula faturamento por período
    calculateRevenue: function(appointments, startDate, endDate) {
        if (!appointments || !Array.isArray(appointments)) return 0;
        
        // Converter datas para objetos Date
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        // Filtrar compromissos no período e com status concluído
        const filteredAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            
            // Verificar se está no período
            const isInPeriod = (!start || appointmentDate >= start) && 
                              (!end || appointmentDate <= end);
            
            // Verificar se está concluído
            const isCompleted = appointment.status === 'concluido';
            
            return isInPeriod && isCompleted;
        });
        
        // Somar valores
        return filteredAppointments.reduce((total, appointment) => {
            // Verificar se tem preço
            if (appointment.price && !isNaN(appointment.price)) {
                return total + parseFloat(appointment.price);
            }
            return total;
        }, 0);
    },
    
    // Agrupa compromissos por dia
    groupAppointmentsByDay: function(appointments) {
        if (!appointments || !Array.isArray(appointments)) return {};
        
        const grouped = {};
        
        appointments.forEach(appointment => {
            const date = new Date(appointment.startDate);
            const dateKey = this.formatDateForInput(date);
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(appointment);
        });
        
        // Ordenar compromissos em cada dia por hora de início
        for (const dateKey in grouped) {
            grouped[dateKey].sort((a, b) => 
                new Date(a.startDate) - new Date(b.startDate)
            );
        }
        
        return grouped;
    },
    
    // ===== FUNÇÕES DE VERIFICAÇÃO DE STATUS =====
    
    // Verifica se um compromisso está em andamento
    isAppointmentInProgress: function(appointment) {
        if (!appointment) return false;
        
        const now = new Date();
        const start = new Date(appointment.startDate);
        const end = new Date(appointment.endDate);
        
        return now >= start && now <= end;
    },
    
    // Verifica se um compromisso está próximo de começar
    isAppointmentUpcoming: function(appointment, minutesThreshold = 30) {
        if (!appointment) return false;
        
        const now = new Date();
        const start = new Date(appointment.startDate);
        
        // Se já começou, não é próximo
        if (now >= start) return false;
        
        // Calcular diferença em minutos
        const diffMs = start - now;
        const diffMinutes = Math.round(diffMs / 60000);
        
        return diffMinutes <= minutesThreshold;
    },
    
    // ===== FUNÇÕES ESPECÍFICAS PARA FULLCALENDAR =====
    
    // Converte compromissos para o formato do FullCalendar
    convertAppointmentsToEvents: function(appointments) {
        if (!appointments || !Array.isArray(appointments)) return [];
        
        return appointments.map(appointment => {
            // Determinar cor com base no status
            let backgroundColor, borderColor, textColor;
            
            switch (appointment.status) {
                case 'concluido':
                    backgroundColor = '#4CAF50'; // Verde
                    borderColor = '#388E3C';
                    textColor = '#FFFFFF';
                    break;
                case 'cancelado':
                    backgroundColor = '#F44336'; // Vermelho
                    borderColor = '#D32F2F';
                    textColor = '#FFFFFF';
                    break;
                default:
                    backgroundColor = '#2196F3'; // Azul (padrão)
                    borderColor = '#1976D2';
                    textColor = '#FFFFFF';
            }
            
            // Criar evento para o FullCalendar
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
                    clientName: appointment.clientName,
                    serviceId: appointment.serviceId,
                    serviceName: appointment.serviceName,
                    price: appointment.price,
                    location: appointment.location,
                    notes: appointment.notes,
                    status: appointment.status || 'agendado'
                }
            };
        });
    },
    
    // Cria conteúdo HTML para tooltip de evento
    createEventTooltip: function(event) {
        let content = `<div class="event-tooltip-title">${event.title}</div>`;
        
        // Adicionar horário
        if (event.start && event.end) {
            const startTime = event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const endTime = event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            content += `<div class="event-tooltip-time">${startTime} - ${endTime}</div>`;
        }
        
        // Adicionar informações extras
        const props = event.extendedProps || {};
        
        if (props.clientName) {
            content += `<div class="event-tooltip-client"><i class="fas fa-user"></i> ${props.clientName}</div>`;
        }
        
        if (props.serviceName) {
            content += `<div class="event-tooltip-service"><i class="fas fa-tag"></i> ${props.serviceName}</div>`;
        }
        
        if (props.price) {
            const formattedPrice = typeof props.price === 'number' 
                ? `R$ ${props.price.toFixed(2).replace('.', ',')}`
                : props.price;
            content += `<div class="event-tooltip-price"><i class="fas fa-dollar-sign"></i> ${formattedPrice}</div>`;
        }
        
        if (props.location) {
            const locationText = props.location === 'salao' ? 'Salão' : 'Domicílio';
            content += `<div class="event-tooltip-location"><i class="fas fa-map-marker-alt"></i> ${locationText}</div>`;
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
            content += `<div class="event-tooltip-status"><i class="fas fa-${statusIcon}"></i> ${statusText}</div>`;
        }
        
        return content;
    }
};
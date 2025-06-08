// Utilitários e funções de renderização para o componente de Agenda
const AgendaUtils = {
    // Funções auxiliares para datas
    
    // Verificar se duas datas são o mesmo dia
    isSameDay: function(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    },
    
    // Obter o primeiro dia da semana (domingo)
    getStartOfWeek: function(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    },
    
    // Obter o último dia da semana (sábado)
    getEndOfWeek: function(date) {
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    },
    
    // Obter o primeiro dia do mês
    getStartOfMonth: function(date) {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return startOfMonth;
    },
    
    // Obter o último dia do mês
    getEndOfMonth: function(date) {
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return endOfMonth;
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
    },
    
    // Funções de renderização
    
    // Renderizar compromissos para um dia específico
    renderAppointmentsForDay: function(container, date, appointments, showAppointmentDetails, showAppointmentModal) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            return this.isSameDay(appointmentDate, date);
        });
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => {
            return new Date(a.startDate) - new Date(b.startDate);
        });
        
        // Adicionar compromissos ao container
        dayAppointments.forEach(appointment => {
            const startDate = new Date(appointment.startDate);
            const endDate = new Date(appointment.endDate);
            
            // Verificar se o compromisso está dentro do horário visível (7h às 22h)
            if (startDate.getHours() >= 7 && startDate.getHours() <= 22) {
                const appointmentElement = document.createElement('div');
                appointmentElement.className = `appointment status-${appointment.status}`;
                appointmentElement.dataset.id = appointment.id;
                
                // Calcular posição e altura
                const top = (startDate.getHours() - 7) * 60 + startDate.getMinutes();
                const durationMinutes = (endDate - startDate) / (1000 * 60);
                const height = Math.max(30, durationMinutes); // Altura mínima de 30px
                
                appointmentElement.style.top = `${top}px`;
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
                    this.addClientInfoToAppointment(appointmentElement, appointment.clientId);
                }
                
                // Adicionar evento de clique para mostrar detalhes
                appointmentElement.addEventListener('click', () => {
                    showAppointmentDetails(appointment.id);
                });
                
                container.appendChild(appointmentElement);
            }
        });
        
        // Adicionar evento de clique para adicionar compromisso
        container.addEventListener('click', (event) => {
            // Verificar se o clique foi diretamente no container (não em um compromisso)
            if (event.target === container) {
                // Calcular a hora com base na posição do clique
                const rect = container.getBoundingClientRect();
                const y = event.clientY - rect.top;
                
                // Converter para hora (7h às 22h)
                const hour = Math.floor(y / 60) + 7;
                const minute = Math.round((y % 60) / 15) * 15; // Arredondar para intervalos de 15 minutos
                
                // Criar data para o compromisso
                const appointmentDate = new Date(date);
                appointmentDate.setHours(hour, minute, 0, 0);
                
                // Mostrar modal para adicionar compromisso
                showAppointmentModal(appointmentDate);
            }
        });
    },
    
    // Renderizar versões mini dos compromissos para a visualização mensal
    renderMiniAppointmentsForDay: function(container, date, appointments, showAppointmentDetails, showDayAppointments) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            return this.isSameDay(appointmentDate, date);
        });
        
        // Ordenar por hora de início
        dayAppointments.sort((a, b) => {
            return new Date(a.startDate) - new Date(b.startDate);
        });
        
        // Limitar a quantidade de compromissos visíveis
        const maxVisibleAppointments = 3;
        const visibleAppointments = dayAppointments.slice(0, maxVisibleAppointments);
        const hiddenAppointments = dayAppointments.slice(maxVisibleAppointments);
        
        // Adicionar compromissos visíveis
        visibleAppointments.forEach(appointment => {
            const startDate = new Date(appointment.startDate);
            
            const appointmentElement = document.createElement('div');
            appointmentElement.className = `appointment-mini status-${appointment.status}`;
            appointmentElement.dataset.id = appointment.id;
            
            // Formatar horário
            const startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Preencher conteúdo
            appointmentElement.innerHTML = `
                <span class="appointment-time">${startTimeStr}</span>
                <span class="appointment-title">${appointment.title}</span>
            `;
            
            // Adicionar evento de clique para mostrar detalhes
            appointmentElement.addEventListener('click', (event) => {
                event.stopPropagation();
                showAppointmentDetails(appointment.id);
            });
            
            container.appendChild(appointmentElement);
        });
        
        // Adicionar indicador de mais compromissos
        if (hiddenAppointments.length > 0) {
            const moreElement = document.createElement('div');
            moreElement.className = 'more-appointments';
            moreElement.textContent = `+ ${hiddenAppointments.length} mais`;
            
            // Adicionar evento de clique para mostrar todos os compromissos
            moreElement.addEventListener('click', (event) => {
                event.stopPropagation();
                showDayAppointments(date);
            });
            
            container.appendChild(moreElement);
        }
    },
    
    // Adicionar informações do cliente ao elemento de compromisso
    addClientInfoToAppointment: function(appointmentElement, clientId) {
        DB.clients.getById(clientId)
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
    },
    
    // Posicionar modal de detalhes
    positionDetailsModal: function(modal) {
        // Obter dimensões da janela
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Obter dimensões do modal
        const modalWidth = modal.offsetWidth;
        const modalHeight = modal.offsetHeight;
        
        // Posicionar no centro da tela
        let left = (windowWidth - modalWidth) / 2;
        let top = (windowHeight - modalHeight) / 2;
        
        // Garantir que o modal não saia da tela
        left = Math.max(10, Math.min(left, windowWidth - modalWidth - 10));
        top = Math.max(10, Math.min(top, windowHeight - modalHeight - 10));
        
        // Aplicar posição
        modal.style.left = `${left}px`;
        modal.style.top = `${top}px`;
    }
};
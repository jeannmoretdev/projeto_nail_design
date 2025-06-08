// Utilitários para o componente de Agenda
const AgendaUtils = {
    // Verificar se duas datas são o mesmo dia
    isSameDay: function(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },
    
    // Obter o primeiro dia da semana (domingo) para uma data
    getStartOfWeek: function(date) {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay(); // 0 = domingo, 1 = segunda, ...
        startOfWeek.setDate(startOfWeek.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    },
    
    // Obter o último dia da semana (sábado) para uma data
    getEndOfWeek: function(date) {
        const endOfWeek = this.getStartOfWeek(date);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    },
    
    // Obter o primeiro dia do mês
    getStartOfMonth: function(date) {
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return startOfMonth;
    },
    
    // Obter o último dia do mês
    getEndOfMonth: function(date) {
        const endOfMonth = new Date(date);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);
        return endOfMonth;
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
    },
    
    // Renderizar compromissos para um dia específico (visualização diária/semanal)
    renderAppointmentsForDay: function(container, date, appointments, onClickCallback, onEmptySpaceClick) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = appointments.filter(appointment => {
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
            
            // Calcular posição e altura
            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
            
            // Ajustar para o horário de início da grade (7h)
            const top = (startHour - 7) * 60;
            const height = (endHour - startHour) * 60;
            
            // Criar elemento do compromisso
            const appointmentElement = document.createElement('div');
            appointmentElement.className = `appointment status-${appointment.status}`;
            appointmentElement.style.top = `${top}px`;
            appointmentElement.style.height = `${height}px`;
            
            // Formatar hora
            const startTimeStr = startDate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const endTimeStr = endDate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Conteúdo do compromisso
            appointmentElement.innerHTML = `
                <div class="appointment-time">${startTimeStr} - ${endTimeStr}</div>
                <div class="appointment-title">${appointment.title}</div>
            `;
            
            // Adicionar informações do cliente se disponível
            if (appointment.clientId) {
                const clientElement = document.createElement('div');
                clientElement.className = 'appointment-client';
                clientElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
                
                appointmentElement.appendChild(clientElement);
                
                // Buscar informações do cliente
                DB.clients.getById(appointment.clientId)
                    .then(client => {
                        if (client) {
                            clientElement.innerHTML = `<i class="fas fa-user"></i> ${client.name}`;
                        } else {
                            clientElement.innerHTML = '';
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao carregar cliente:', error);
                        clientElement.innerHTML = '';
                    });
            }
            
            // Adicionar evento de clique
            appointmentElement.addEventListener('click', (event) => {
                event.stopPropagation();
                onClickCallback(appointment.id);
            });
            
            container.appendChild(appointmentElement);
        });
        
        // Adicionar evento de clique na grade vazia
        container.addEventListener('click', (event) => {
            // Verificar se o clique foi diretamente na grade (não em um compromisso)
            if (event.target === container) {
                // Calcular hora com base na posição do clique
                const rect = container.getBoundingClientRect();
                const offsetY = event.clientY - rect.top + container.scrollTop;
                
                // Converter para hora (7h + offsetY / 60)
                const hour = Math.floor(7 + offsetY / 60);
                const minute = Math.floor((offsetY % 60) / 60 * 60);
                
                // Criar data com a hora calculada
                const clickDate = new Date(date);
                clickDate.setHours(hour, minute, 0, 0);
                
                onEmptySpaceClick(clickDate);
            }
        });
    },
    
    // Renderizar mini-compromissos para visualização mensal
    renderMiniAppointmentsForDay: function(container, date, appointments, onClickCallback, onMoreClick) {
        // Filtrar compromissos para o dia específico
        const dayAppointments = appointments.filter(appointment => {
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
            const startDate = new Date(appointment.startDate);
            
            // Formatar hora
            const startTimeStr = startDate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Criar elemento do compromisso
            const appointmentElement = document.createElement('div');
            appointmentElement.className = `appointment-mini status-${appointment.status}`;
            
            // Conteúdo do compromisso
            appointmentElement.innerHTML = `
                <div class="appointment-time">${startTimeStr}</div>
                <div class="appointment-title">${appointment.title}</div>
            `;
            
            // Adicionar evento de clique
            appointmentElement.addEventListener('click', (event) => {
                event.stopPropagation();
                onClickCallback(appointment.id);
            });
            
            container.appendChild(appointmentElement);
        });
        
        // Adicionar indicador de "mais compromissos" se necessário
        if (hiddenCount > 0) {
            const moreElement = document.createElement('div');
            moreElement.className = 'more-appointments';
            moreElement.textContent = `+ ${hiddenCount} mais`;
            
            // Adicionar evento de clique
            moreElement.addEventListener('click', (event) => {
                event.stopPropagation();
                onMoreClick(date);
            });
            
            container.appendChild(moreElement);
        }
    },
    
    // Posicionar modal de detalhes
    positionDetailsModal: function(modal) {
        // Verificar se o modal está fora da tela
        const rect = modal.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Ajustar posição horizontal se necessário
        if (rect.right > viewportWidth) {
            modal.style.left = `${viewportWidth - rect.width - 20}px`;
            modal.style.transform = 'translateY(-50%)';
        }
        
        // Ajustar posição vertical se necessário
        if (rect.bottom > viewportHeight) {
            modal.style.top = `${viewportHeight - rect.height - 20}px`;
            modal.style.transform = 'translateX(-50%)';
        }
        
        // Ajustar ambos se necessário
        if (rect.right > viewportWidth && rect.bottom > viewportHeight) {
            modal.style.top = `${viewportHeight - rect.height - 20}px`;
            modal.style.left = `${viewportWidth - rect.width - 20}px`;
            modal.style.transform = 'none';
        }
    },
    
    // Formatar período para exibição no cabeçalho
    formatPeriodHeader: function(date, view) {
        switch (view) {
            case 'day':
                return date.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });
                
            case 'week': {
                const startOfWeek = this.getStartOfWeek(date);
                const endOfWeek = this.getEndOfWeek(date);
                
                // Se mesmo mês
                if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} de ${startOfWeek.getFullYear()}`;
                }
                
                // Se mesmo ano
                if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
                    return `${startOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} de ${startOfWeek.getFullYear()}`;
                }
                
                // Anos diferentes
                return `${startOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} de ${startOfWeek.getFullYear()} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('pt-BR', { month: 'long' })} de ${endOfWeek.getFullYear()}`;
            }
                
            case 'month':
                return date.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                
            default:
                return '';
        }
    },
    
    // Validar formulário de compromisso
    validateAppointmentForm: function(formData) {
        const errors = [];
        
        // Validar título
        if (!formData.title || formData.title.trim() === '') {
            errors.push('O título do compromisso é obrigatório.');
        }
        
        // Validar data e horários
        if (!formData.date) {
            errors.push('A data do compromisso é obrigatória.');
        }
        
        if (!formData.startTime) {
            errors.push('O horário de início é obrigatório.');
        }
        
        if (!formData.endTime) {
            errors.push('O horário de término é obrigatório.');
        }
        
        // Validar se o horário de término é posterior ao de início
        if (formData.date && formData.startTime && formData.endTime) {
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
            
            if (endDateTime <= startDateTime) {
                errors.push('O horário de término deve ser posterior ao horário de início.');
            }
        }
        
        // Validar preço (se informado)
        if (formData.price && isNaN(parseFloat(formData.price.replace(',', '.')))) {
            errors.push('O preço informado é inválido.');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // Verificar sobreposição de compromissos
    checkAppointmentOverlap: function(appointments, newAppointment, excludeId = null) {
        const newStart = new Date(newAppointment.startDate);
        const newEnd = new Date(newAppointment.endDate);
        
        // Filtrar compromissos do mesmo dia
        const sameDayAppointments = appointments.filter(appointment => {
            // Ignorar o próprio compromisso em caso de edição
            if (excludeId && appointment.id === excludeId) {
                return false;
            }
            
            const appointmentDate = new Date(appointment.startDate);
            return this.isSameDay(appointmentDate, newStart);
        });
        
        // Verificar sobreposição
        const overlappingAppointments = sameDayAppointments.filter(appointment => {
            const start = new Date(appointment.startDate);
            const end = new Date(appointment.endDate);
            
            // Verificar se há sobreposição
            // (newStart < end) && (newEnd > start)
            return newStart < end && newEnd > start;
        });
        
        return {
            hasOverlap: overlappingAppointments.length > 0,
            overlappingAppointments: overlappingAppointments
        };
    },
    
    // Calcular duração entre duas datas em minutos
    calculateDurationInMinutes: function(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const diffMs = end - start;
        return Math.floor(diffMs / (1000 * 60));
    },
    
    // Formatar duração em horas e minutos
    formatDuration: function(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins} minutos`;
        } else if (hours === 1) {
            if (mins === 0) {
                return '1 hora';
            } else {
                return `1 hora e ${mins} minutos`;
            }
        } else {
            if (mins === 0) {
                return `${hours} horas`;
            } else {
                return `${hours} horas e ${mins} minutos`;
            }
        }
    },
    
    // Gerar cores para categorias de serviços
    generateCategoryColors: function(categories) {
        const colors = {};
        const baseHues = [0, 60, 120, 180, 240, 300]; // Vermelho, amarelo, verde, ciano, azul, magenta
        
        categories.forEach((category, index) => {
            // Usar hue rotativo para categorias
            const hue = baseHues[index % baseHues.length];
            // Variar a saturação e luminosidade para categorias com mesmo hue
            const saturation = 70 + (Math.floor(index / baseHues.length) * 10);
            const lightness = 50 - (Math.floor(index / baseHues.length) * 5);
            
            colors[category] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        
        return colors;
    },
    
    // Calcular faturamento por período
    calculateRevenue: function(appointments, startDate, endDate) {
        // Filtrar compromissos no período e com status concluído
        const filteredAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startDate);
            return appointmentDate >= startDate && 
                   appointmentDate <= endDate && 
                   appointment.status === 'concluido';
        });
        
        // Somar preços
        const total = filteredAppointments.reduce((sum, appointment) => {
            return sum + (appointment.price || 0);
        }, 0);
        
        return {
            total: total,
            count: filteredAppointments.length,
            appointments: filteredAppointments
        };
    },
    
    // Agrupar compromissos por dia
    groupAppointmentsByDay: function(appointments) {
        const grouped = {};
        
        appointments.forEach(appointment => {
            const date = new Date(appointment.startDate);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            
            grouped[dateStr].push(appointment);
        });
        
        // Ordenar compromissos em cada dia
        for (const dateStr in grouped) {
            grouped[dateStr].sort((a, b) => {
                return new Date(a.startDate) - new Date(b.startDate);
            });
        }
        
        return grouped;
    },
    
    // Verificar se um compromisso está em andamento
    isAppointmentInProgress: function(appointment) {
        const now = new Date();
        const start = new Date(appointment.startDate);
        const end = new Date(appointment.endDate);
        
        return now >= start && now <= end;
    },
    
    // Verificar se um compromisso está próximo de começar
    isAppointmentUpcoming: function(appointment, minutesThreshold = 30) {
        const now = new Date();
        const start = new Date(appointment.startDate);
        
        // Verificar se o compromisso ainda não começou
        if (start > now) {
            // Calcular diferença em minutos
            const diffMs = start - now;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            
            // Verificar se está dentro do limite de tempo
            return diffMinutes <= minutesThreshold;
        }
        
        return false;
    }
};
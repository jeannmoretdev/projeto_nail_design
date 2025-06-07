// Componente de Notificações
const NotificationsComponent = {
    // Verificar aniversariantes do mês
    checkBirthdaysThisMonth: function() {
        const today = new Date();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        const currentDay = today.getDate();
        
        DB.clients.getAll()
            .then(clients => {
                const birthdayClients = clients.filter(client => {
                    if (client.birthday && client.birthday.includes('/')) {
                        const [day, month] = client.birthday.split('/').map(num => parseInt(num, 10));
                        // Verificar se é o mês atual E se o dia ainda não passou E se faltam menos de 3 dias
                        return month.toString().padStart(2, '0') === currentMonth && 
                               day >= currentDay && 
                               (day - currentDay) <= 3;
                    }
                    return false;
                });
                
                if (birthdayClients.length > 0) {
                    this.showBirthdayNotification(birthdayClients);
                }
            })
            .catch(error => {
                console.error('Erro ao verificar aniversariantes:', error);
            });
    },
    
    // Mostrar notificação de aniversariantes
    showBirthdayNotification: function(clients) {
        const notification = document.createElement('div');
        notification.className = 'birthday-notification';
        
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const currentMonth = new Date().getMonth();
        
        notification.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-birthday-cake"></i>
                <h3>Aniversariantes de ${monthNames[currentMonth]}</h3>
                <button class="close-notification">&times;</button>
            </div>
            <div class="notification-content">
                <ul>
                    ${clients.map(client => {
                        const birthdayInfo = ClientsComponent.getDaysUntilBirthday(client.birthday);
                        const birthdayText = ClientsComponent.formatDaysUntilBirthday(birthdayInfo.days);
                        return `
                            <li>
                                <strong>${client.name}</strong> - Dia ${client.birthday.split('/')[0]}
                                ${birthdayText ? `<span class="birthday-countdown">${birthdayText}</span>` : ''}
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Fechar notificação
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-fechar após 10 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 10000);
    },

    // Atualizar a função que calcula os dias até o aniversário
    calculateDaysUntilBirthday: function(birthday) {
        if (!birthday || !birthday.includes('/')) {
            return null;
        }
        
        const today = new Date();
        const [day, month] = birthday.split('/').map(num => parseInt(num, 10));
        
        // Criar data do aniversário no ano atual
        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
        
        // Se o aniversário já passou este ano, calcular para o próximo ano
        if (birthdayThisYear < today) {
            return null; // Retorna null para aniversários que já passaram este ano
        }
        
        // Calcular a diferença em dias
        const diffTime = birthdayThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },

    // Atualizar a função que verifica aniversários próximos
    checkUpcomingBirthdays: function() {
        DB.clients.getAll()
            .then(clients => {
                const upcomingBirthdays = clients
                    .map(client => {
                        const days = this.calculateDaysUntilBirthday(client.birthday);
                        return { client, days };
                    })
                    .filter(item => item.days !== null && item.days <= 3) // Mostrar alerta apenas para aniversários nos próximos 3 dias
                    .sort((a, b) => a.days - b.days); // Ordenar por proximidade
            
                if (upcomingBirthdays.length > 0) {
                    this.showUpcomingBirthdaysNotification(upcomingBirthdays);
                }
            })
            .catch(error => {
                console.error('Erro ao verificar aniversários próximos:', error);
            });
    }
};
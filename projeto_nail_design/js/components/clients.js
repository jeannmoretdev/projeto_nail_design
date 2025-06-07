// Componente de Clientes
const ClientsComponent = {
    // Elementos DOM
    elements: {
        addClientBtn: null,
        clientModal: null,
        closeModal: null,
        clientForm: null,
        cancelBtn: null,
        clientSearch: null,
        clientsList: null,
        birthdayInput: null,
        phoneInput: null
    },
    
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template
            await TemplateLoader.loadTemplate('clients', 'clients');
            
            // Inicializar elementos DOM após carregar o template
            this.initElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Carregar dados
            this.loadClients();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de clientes:', error);
            document.getElementById('clients').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar o componente de clientes.</p>
                    <p>Detalhes: ${error.message}</p>
                </div>
            `;
            return false;
        }
    },
    
    // Inicializar referências aos elementos DOM
    initElements: function() {
        this.elements = {
            addClientBtn: document.getElementById('add-client-btn'),
            clientModal: document.getElementById('client-modal'),
            closeModal: document.querySelector('.close-modal'),
            clientForm: document.getElementById('client-form'),
            cancelBtn: document.querySelector('.btn-cancel'),
            clientSearch: document.getElementById('client-search'),
            clientsList: document.getElementById('clients-list'),
            birthdayInput: document.getElementById('client-birthday'),
            phoneInput: document.getElementById('client-phone')
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
        if (!this.elements.addClientBtn) {
            console.error('Botão de adicionar cliente não encontrado');
            return;
        }
        
        // Abrir modal para adicionar cliente
        this.elements.addClientBtn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Novo Cliente';
            this.elements.clientForm.reset();
            document.getElementById('client-id').value = '';
            this.elements.clientModal.style.display = 'block';
        });
        
        // Fechar modal
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => {
                this.elements.clientModal.style.display = 'none';
            });
        }
        
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', () => {
                this.elements.clientModal.style.display = 'none';
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            if (this.elements.clientModal && event.target === this.elements.clientModal) {
                this.elements.clientModal.style.display = 'none';
            }
        });
        
        // Formatar entrada de aniversário (DD/MM)
        if (this.elements.birthdayInput) {
            this.elements.birthdayInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                
                e.target.value = value;
            });
        }
        
        // Formatar e validar entrada de telefone
        if (this.elements.phoneInput) {
            const self = this; // Armazenar referência ao this para usar dentro dos event listeners
            
            this.elements.phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                if (value.length > 0) {
                    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
                    if (value.length <= 2) {
                        formattedValue = `(${value}`;
                    } else if (value.length <= 7) {
                        formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                    } else if (value.length <= 11) {
                        formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
                    } else {
                        formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
                    }
                }
                
                e.target.value = formattedValue;
            });
            
            // Adicionar validação ao perder o foco
            this.elements.phoneInput.addEventListener('blur', function(e) {
                // Se o campo estiver vazio, não validar
                if (!e.target.value || e.target.value.trim() === '') {
                    return;
                }
                
                const validation = self.validatePhone(e.target.value);
                
                if (!validation.valid) {
                    alert(validation.message);
                    e.target.focus();
                    return;
                }
                
                if (validation.warning) {
                    if (!confirm(validation.message)) {
                        e.target.focus();
                    }
                }
            });
        }
        
        // Salvar cliente com validação adicional
        if (this.elements.clientForm) {
            const self = this; // Armazenar referência ao this para usar dentro do event listener
            
            this.elements.clientForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Validar telefone antes de salvar (apenas se estiver preenchido)
                const phoneInput = document.getElementById('client-phone');
                if (phoneInput && phoneInput.value && phoneInput.value.trim() !== '') {
                    const validation = self.validatePhone(phoneInput.value);
                    if (!validation.valid) {
                        alert(validation.message);
                        phoneInput.focus();
                        return;
                    }
                    
                    if (validation.warning) {
                        if (!confirm(validation.message)) {
                            phoneInput.focus();
                            return;
                        }
                    }
                }
                
                // Resto do código para salvar o cliente...
                const clientId = document.getElementById('client-id').value;
                const client = {
                    name: document.getElementById('client-name').value || '',
                    phone: document.getElementById('client-phone').value || '',
                    birthday: document.getElementById('client-birthday').value || '',
                    location: document.getElementById('client-location').value || '',
                    services: document.getElementById('client-services').value || '',
                    notes: document.getElementById('client-notes').value || ''
                };
                
                // Verificar se pelo menos um campo foi preenchido
                const hasData = Object.values(client).some(value => value.trim() !== '');
                
                if (!hasData) {
                    alert('Por favor, preencha pelo menos um campo.');
                    return;
                }
                
                if (clientId) {
                    // Atualizar cliente existente
                    client.id = parseInt(clientId);
                    DB.clients.update(client)
                        .then(() => {
                            self.loadClients();
                            self.elements.clientModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('Erro ao atualizar cliente:', error);
                            alert('Erro ao atualizar cliente. Tente novamente.');
                        });
                } else {
                    // Adicionar novo cliente
                    DB.clients.add(client)
                        .then(() => {
                            self.loadClients();
                            self.elements.clientModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('Erro ao adicionar cliente:', error);
                            alert('Erro ao adicionar cliente. Tente novamente.');
                        });
                }
            });
        }
        
        // Buscar clientes
        if (this.elements.clientSearch) {
            this.elements.clientSearch.addEventListener('input', () => {
                const query = this.elements.clientSearch.value.trim();
                this.loadClients(query);
            });
        }
    },
    
    // Calcular dias até o próximo aniversário
    getDaysUntilBirthday: function(birthday) {
        if (!birthday || !birthday.includes('/')) {
            return { days: null, isUpcoming: false };
        }
        
        const today = new Date();
        const currentYear = today.getFullYear();
        
        const parts = birthday.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-11
        
        // Criar data do aniversário deste ano
        let birthdayThisYear = new Date(currentYear, month, day);
        
        // Se o aniversário deste ano já passou, calcular para o próximo ano
        if (today > birthdayThisYear) {
            birthdayThisYear = new Date(currentYear + 1, month, day);
        }
        
        // Calcular diferença em dias
        const diffTime = birthdayThisYear - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return { 
            days: diffDays,
            isUpcoming: diffDays <= 30
        };
    },
    
    // Formatar texto de dias até o aniversário
    formatDaysUntilBirthday: function(days) {
        if (days === null) return '';
        
        if (days === 0) {
            return 'Hoje!';
        } else if (days === 1) {
            return 'Amanhã!';
        } else {
            return `Faltam ${days} dias`;
        }
    },
    
    // Carregar lista de clientes
    loadClients: function(query = '') {
        if (!this.elements.clientsList) {
            console.error('Lista de clientes não encontrada no DOM');
            return;
        }
        
        DB.clients.search(query)
            .then(clients => {
                const sortedClients = this.sortClientsByName(clients);
                this.renderClientsList(sortedClients);
            })
            .catch(error => {
                console.error('Erro ao buscar clientes:', error);
                this.elements.clientsList.innerHTML = '<p class="error-message">Erro ao carregar clientes</p>';
            });
    },
    
    // Renderizar lista de clientes
    renderClientsList: function(clients) {
        if (!this.elements.clientsList) {
            console.error('Lista de clientes não encontrada no DOM');
            return;
        }
        
        if (clients.length === 0) {
            this.elements.clientsList.innerHTML = '<p class="empty-message">Nenhum cliente encontrado</p>';
            return;
        }
        
        this.elements.clientsList.innerHTML = '';
        
        clients.forEach(client => {
            const clientCard = this.renderClientCard(client);
            
            this.elements.clientsList.appendChild(clientCard);
            
            // Adicionar evento para expandir/recolher detalhes
            const clientInfo = clientCard.querySelector('.client-info');
            const clientDetails = clientCard.querySelector('.client-details');
            
            clientInfo.addEventListener('click', () => {
                clientDetails.classList.toggle('active');
            });
            
            // Adicionar eventos aos botões de editar e excluir
            const editBtn = clientCard.querySelector('.edit-btn');
            const deleteBtn = clientCard.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const clientId = parseInt(clientCard.dataset.id);
                this.editClient(clientId);
            });
            
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const clientId = parseInt(clientCard.dataset.id);
                this.deleteClient(clientId);
            });
        });
    },
    
    // Atualizar a função que renderiza os detalhes do cliente
    renderClientCard: function(client) {
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.dataset.id = client.id;
        
        // Calcular dias até o aniversário (se aplicável)
        let birthdayInfo = '';
        if (client.birthday) {
            const daysUntilBirthday = this.calculateDaysUntilBirthday(client.birthday);
            
            if (daysUntilBirthday !== null) {
                // Só mostra os dias restantes se o aniversário ainda não passou este ano
                // Adicionar classe para estilização baseada na proximidade
                let countdownClass = '';
                if (daysUntilBirthday <= 30) {
                    countdownClass = 'birthday-soon';
                }
                if (daysUntilBirthday <= 7) {
                    countdownClass = 'birthday-very-soon';
                }
                if (daysUntilBirthday <= 3) {
                    countdownClass = 'birthday-imminent';
                }
                
                birthdayInfo = `<div class="client-birthday">
                    <i class="fas fa-birthday-cake"></i> ${client.birthday}
                    <span class="birthday-countdown ${countdownClass}">Faltam ${daysUntilBirthday} dias</span>
                </div>`;
            } else {
                // Se já passou, mostra apenas a data
                birthdayInfo = `<div class="client-birthday">
                    <i class="fas fa-birthday-cake"></i> ${client.birthday}
                </div>`;
            }
        }
        
        // Criar a visualização em miniatura (linha)
        clientCard.innerHTML = `
            <div class="client-summary">
                <div class="client-info">
                    <div class="client-name">${client.name}</div>
                    <div class="client-mini-details">
                        <div class="client-phone"><i class="fas fa-phone"></i> ${client.phone}</div>
                        ${birthdayInfo}
                    </div>
                </div>
                <div class="client-actions">
                    <button class="edit-btn" title="Editar cliente"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" title="Excluir cliente"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            
            <div class="client-details">
                ${client.location ? `
                    <div class="detail-item">
                        <div class="detail-label">Local</div>
                        <div class="detail-value">${client.location}</div>
                    </div>
                ` : ''}
                
                ${client.services ? `
                    <div class="detail-item">
                        <div class="detail-label">Serviços</div>
                        <div class="detail-value">${client.services}</div>
                    </div>
                ` : ''}
                
                ${client.notes ? `
                    <div class="detail-item">
                        <div class="detail-label">Observações</div>
                        <div class="detail-value">${client.notes}</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return clientCard;
    },
    
    // Adicionar a função que calcula os dias até o aniversário
    calculateDaysUntilBirthday: function(birthday) {
        if (!birthday || !birthday.includes('/')) {
            return null;
        }
        
        const today = new Date();
        const [day, month] = birthday.split('/').map(num => parseInt(num, 10));
        
        // Criar data do aniversário no ano atual
        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
        
        // Se o aniversário já passou este ano, retorna null
        if (birthdayThisYear < today) {
            return null;
        }
        
        // Calcular a diferença em dias
        const diffTime = birthdayThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },
    
    // Editar cliente
    editClient: function(clientId) {
        DB.clients.getById(clientId)
            .then(client => {
                if (client) {
                    document.getElementById('modal-title').textContent = 'Editar Cliente';
                    document.getElementById('client-id').value = client.id;
                    document.getElementById('client-name').value = client.name;
                    document.getElementById('client-phone').value = client.phone;
                    document.getElementById('client-birthday').value = client.birthday || '';
                    document.getElementById('client-location').value = client.location || '';
                    document.getElementById('client-services').value = client.services || '';
                    document.getElementById('client-notes').value = client.notes || '';
                    
                    this.elements.clientModal.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar cliente para edição:', error);
                alert('Erro ao carregar dados do cliente. Tente novamente.');
            });
    },
    
    // Excluir cliente
    deleteClient: function(clientId) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            DB.clients.delete(clientId)
                .then(() => {
                    this.loadClients();
                })
                .catch(error => {
                    console.error('Erro ao excluir cliente:', error);
                    alert('Erro ao excluir cliente. Tente novamente.');
                });
        }
    },
    
    // Função para ordenar clientes por nome
    sortClientsByName: function(clients) {
        return clients.sort((a, b) => {
            return a.name.localeCompare(b.name, 'pt-BR');
        });
    }
};
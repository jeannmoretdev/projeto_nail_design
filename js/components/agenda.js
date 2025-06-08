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
    
    // Método de inicialização
    init: async function() {
        try {
            // Verificar se o FullCalendar está disponível
            if (typeof FullCalendar === 'undefined') {
                throw new Error('FullCalendar não está disponível. Verifique se a biblioteca foi carregada corretamente.');
            }
            
            // Verificar se o locale pt-br está disponível
            if (FullCalendar.globalLocales) {
                const ptBrLocale = FullCalendar.globalLocales.find(locale => locale.code === 'pt-br');
                if (!ptBrLocale) {
                    console.warn('Locale pt-br não encontrado. Carregando manualmente...');
                    
                    // Definir locale pt-br manualmente
                    FullCalendar.globalLocales.push({
                        code: 'pt-br',
                        week: {
                            dow: 0, // Domingo é o primeiro dia da semana
                            doy: 4  // A semana que contém Jan 4th é a primeira semana do ano
                        },
                        buttonText: {
                            prev: 'Anterior',
                            next: 'Próximo',
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia',
                            list: 'Lista'
                        },
                        weekText: 'Sem',
                        allDayText: 'Dia inteiro',
                        moreLinkText: function(n) {
                            return 'mais +' + n;
                        },
                        noEventsText: 'Não há eventos para mostrar'
                    });
                }
            }
            
            // Carregar o template
            document.getElementById('agenda').innerHTML = agendaTemplate;
            
            // Adicionar o template de detalhes do compromisso ao DOM
            if (typeof appointmentDetailsTemplate !== 'undefined') {
                document.body.insertAdjacentHTML('beforeend', appointmentDetailsTemplate);
            }
            
            // Inicializar elementos DOM
            this.initElements();
            
            // Garantir que o campo de título exista
            this.ensureTitleFieldExists();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar o calendário
            const calendarInitialized = this.initCalendar();
            
            if (!calendarInitialized) {
                throw new Error('Falha ao inicializar o calendário');
            }
            
            // Carregar clientes e serviços
            this.loadClients()
                .then(() => this.loadServices())
                .catch(error => console.error('Erro ao carregar dados iniciais:', error));
            
            // Carregar compromissos
            try {
                await this.loadAppointments();
            } catch (appointmentError) {
                console.error('Erro ao carregar compromissos:', appointmentError);
                // Continuar mesmo com erro nos compromissos
            }
            
            // Inicializar extensões
            if (typeof AgendaExtensions !== 'undefined') {
                AgendaExtensions.init(this);
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de agenda:', error);
            document.getElementById('agenda').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar o componente de agenda.</p>
                    <p>Detalhes: ${error.message}</p>
                    <p>Verifique se todas as dependências foram carregadas corretamente.</p>
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
    
    // Método para carregar clientes no select
    loadClients: function() {
        return new Promise((resolve, reject) => {
            try {
                const clientSelect = document.getElementById('appointment-client');
                if (!clientSelect) {
                    console.error('Select de cliente não encontrado');
                    return resolve(false);
                }
                
                // Limpar opções existentes, mantendo apenas a primeira e a última
                while (clientSelect.options.length > 2) {
                    clientSelect.remove(1);
                }
                
                // Buscar clientes
                DB.clients.getAll()
                    .then(clients => {
                        // Ordenar clientes por nome
                        clients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                        
                        // Adicionar clientes ao select
                        clients.forEach(client => {
                            const option = document.createElement('option');
                            option.value = client.id;
                            option.textContent = client.name;
                            
                            // Inserir antes da opção "Novo Cliente"
                            clientSelect.insertBefore(option, clientSelect.lastChild);
                        });
                        
                        resolve(true);
                    })
                    .catch(error => {
                        console.error('Erro ao carregar clientes:', error);
                        resolve(false);
                    });
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                resolve(false);
            }
        });
    },

    // Método para carregar serviços no select
    loadServices: function() {
        return new Promise((resolve, reject) => {
            try {
                const serviceSelect = document.getElementById('appointment-service');
                if (!serviceSelect) {
                    console.error('Select de serviço não encontrado');
                    return resolve(false);
                }
                
                // Limpar opções existentes, mantendo apenas a primeira e a última
                while (serviceSelect.options.length > 2) {
                    serviceSelect.remove(1);
                }
                
                // Buscar serviços
                DB.services.getAll()
                    .then(services => {
                        // Ordenar serviços por nome
                        services.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                        
                        // Agrupar serviços por categoria
                        const servicesByCategory = {};
                        services.forEach(service => {
                            const category = service.category || 'Sem categoria';
                            if (!servicesByCategory[category]) {
                                servicesByCategory[category] = [];
                            }
                            servicesByCategory[category].push(service);
                        });
                        
                        // Adicionar serviços ao select, agrupados por categoria
                        Object.keys(servicesByCategory).sort().forEach(category => {
                            // Criar grupo de opções para a categoria
                            const optgroup = document.createElement('optgroup');
                            optgroup.label = category;
                            
                            // Adicionar serviços da categoria
                            servicesByCategory[category].forEach(service => {
                                const option = document.createElement('option');
                                option.value = service.id;
                                option.textContent = service.name;
                                
                                // Adicionar preço como data-attribute
                                if (service.price) {
                                    option.dataset.price = service.price;
                                }
                                
                                optgroup.appendChild(option);
                            });
                            
                            // Inserir antes da opção "Novo Serviço"
                            serviceSelect.insertBefore(optgroup, serviceSelect.lastChild);
                        });
                        
                        resolve(true);
                    })
                    .catch(error => {
                        console.error('Erro ao carregar serviços:', error);
                        resolve(false);
                    });
            } catch (error) {
                console.error('Erro ao carregar serviços:', error);
                resolve(false);
            }
        });
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
        
        // Configurar selects de cliente e serviço com opções para cadastro
        this.setupClientSelect();
        this.setupServiceSelect();
    },
    
    // Método para configurar o select de clientes
    setupClientSelect: function() {
        const clientSelect = document.getElementById('appointment-client');
        if (!clientSelect) return;
        
        // Carregar clientes existentes
        DB.clients.getAll()
            .then(clients => {
                // Limpar opções existentes
                clientSelect.innerHTML = '';
                
                // Adicionar opção padrão
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecione um cliente';
                clientSelect.appendChild(defaultOption);
                
                // Adicionar clientes
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name;
                    clientSelect.appendChild(option);
                });
                
                // Adicionar opção para novo cliente
                const newClientOption = document.createElement('option');
                newClientOption.value = 'new';
                newClientOption.textContent = '+ Cadastrar Novo Cliente';
                newClientOption.className = 'new-item-option';
                clientSelect.appendChild(newClientOption);
            })
            .catch(error => {
                console.error('Erro ao carregar clientes:', error);
            });
        
        // Adicionar evento para detectar seleção de "Novo Cliente"
        clientSelect.addEventListener('change', () => {
            if (clientSelect.value === 'new') {
                // Resetar o select para a opção padrão
                clientSelect.value = '';
                
                // Abrir modal de cadastro de cliente
                this.openNewClientModal();
            }
        });
    },
    
    // Método para configurar o select de serviços
    setupServiceSelect: function() {
        const serviceSelect = document.getElementById('appointment-service');
        if (!serviceSelect) return;
        
        // Carregar serviços existentes
        DB.services.getAll()
            .then(services => {
                // Limpar opções existentes
                serviceSelect.innerHTML = '';
                
                // Adicionar opção padrão
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecione um serviço';
                serviceSelect.appendChild(defaultOption);
                
                // Adicionar serviços
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.id;
                    option.textContent = service.name;
                    if (service.price) {
                        option.textContent += ` - R$ ${service.price.toFixed(2).replace('.', ',')}`;
                    }
                    serviceSelect.appendChild(option);
                });
                
                // Adicionar opção para novo serviço
                const newServiceOption = document.createElement('option');
                newServiceOption.value = 'new';
                newServiceOption.textContent = '+ Cadastrar Novo Serviço';
                newServiceOption.className = 'new-item-option';
                serviceSelect.appendChild(newServiceOption);
            })
            .catch(error => {
                console.error('Erro ao carregar serviços:', error);
            });
        
        // Adicionar evento para detectar seleção de "Novo Serviço"
        serviceSelect.addEventListener('change', () => {
            if (serviceSelect.value === 'new') {
                // Resetar o select para a opção padrão
                serviceSelect.value = '';
                
                // Abrir modal de cadastro de serviço
                this.openNewServiceModal();
            }
        });
    },
    
    // Método para abrir o modal de cadastro de cliente
    openNewClientModal: function() {
        // Verificar se o componente de clientes está disponível
        if (typeof ClientsComponent !== 'undefined' && ClientsComponent.elements && ClientsComponent.elements.clientModal) {
            // Resetar o formulário
            if (ClientsComponent.elements.clientForm) {
                ClientsComponent.elements.clientForm.reset();
            }
            
            // Definir título do modal
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Novo Cliente';
            }
            
            // Limpar ID (para garantir que é um novo registro)
            const clientIdInput = document.getElementById('client-id');
            if (clientIdInput) {
                clientIdInput.value = '';
            }
            
            // Mostrar o modal
            ClientsComponent.elements.clientModal.style.display = 'block';
            
            // Adicionar callback para quando o cliente for salvo
            const originalSubmitHandler = ClientsComponent.elements.clientForm.onsubmit;
            ClientsComponent.elements.clientForm.onsubmit = async (event) => {
                event.preventDefault();
                
                // Obter dados do formulário
                const clientData = {
                    name: document.getElementById('client-name').value || '',
                    phone: document.getElementById('client-phone').value || '',
                    birthday: document.getElementById('client-birthday').value || '',
                    location: document.getElementById('client-location').value || '',
                    services: document.getElementById('client-services').value || '',
                    notes: document.getElementById('client-notes').value || ''
                };
                
                // Validar dados
                if (!clientData.name) {
                    alert('Por favor, informe o nome do cliente.');
                    return;
                }
                
                try {
                    // Adicionar cliente
                    const clientId = await DB.clients.add(clientData);
                    
                    // Fechar o modal
                    ClientsComponent.elements.clientModal.style.display = 'none';
                    
                    // Restaurar o handler original
                    ClientsComponent.elements.clientForm.onsubmit = originalSubmitHandler;
                    
                    // Atualizar o select de clientes e selecionar o novo cliente
                    this.setupClientSelect();
                    
                    // Aguardar um pouco para garantir que o select foi atualizado
                    setTimeout(() => {
                        const clientSelect = document.getElementById('appointment-client');
                        if (clientSelect) {
                            clientSelect.value = clientId;
                        }
                    }, 500);
                    
                    // Mostrar mensagem de sucesso
                    alert('Cliente cadastrado com sucesso!');
                } catch (error) {
                    console.error('Erro ao adicionar cliente:', error);
                    alert('Erro ao cadastrar cliente. Tente novamente.');
                }
            };
        } else {
            alert('O componente de clientes não está disponível. Por favor, tente novamente mais tarde.');
        }
    },
    
    // Método para abrir o modal de cadastro de serviço
    openNewServiceModal: function() {
        // Verificar se o componente de serviços está disponível
        if (typeof ServicesComponent !== 'undefined' && ServicesComponent.elements && ServicesComponent.elements.serviceModal) {
            // Resetar o formulário
            if (ServicesComponent.elements.serviceForm) {
                ServicesComponent.elements.serviceForm.reset();
            }
            
            // Definir título do modal
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Novo Serviço';
            }
            
            // Limpar ID (para garantir que é um novo registro)
            const serviceIdInput = document.getElementById('service-id');
            if (serviceIdInput) {
                serviceIdInput.value = '';
            }
            
            // Mostrar o modal
            ServicesComponent.elements.serviceModal.style.display = 'block';
            
            // Adicionar callback para quando o serviço for salvo
            const originalSubmitHandler = ServicesComponent.elements.serviceForm.onsubmit;
            ServicesComponent.elements.serviceForm.onsubmit = async (event) => {
                event.preventDefault();
                
                // Obter categoria
                let category = '';
                const categorySelect = document.getElementById('service-category');
                if (categorySelect) {
                    category = categorySelect.value;
                    
                    if (category === 'nova_categoria') {
                        const newCategoryInput = document.getElementById('new-category');
                        if (newCategoryInput && newCategoryInput.value.trim()) {
                            category = newCategoryInput.value.trim();
                        } else {
                            alert('Por favor, informe o nome da nova categoria.');
                            return;
                        }
                    }
                }
                
                // Converter preço para formato numérico
                let price = document.getElementById('service-price').value;
                if (price) {
                    price = parseFloat(price.replace(',', '.'));
                } else {
                    price = 0;
                }
                
                // Obter dados do formulário
                const serviceData = {
                    name: document.getElementById('service-name').value || '',
                    category: category,
                    price: price,
                    description: document.getElementById('service-description').value || ''
                };
                
                // Validar dados
                if (!serviceData.name) {
                    alert('Por favor, informe o nome do serviço.');
                    return;
                }
                
                try {
                    // Adicionar serviço
                    const serviceId = await DB.services.add(serviceData);
                    
                    // Fechar o modal
                    ServicesComponent.elements.serviceModal.style.display = 'none';
                    
                    // Restaurar o handler original
                    ServicesComponent.elements.serviceForm.onsubmit = originalSubmitHandler;
                    
                    // Atualizar o select de serviços e selecionar o novo serviço
                    this.setupServiceSelect();
                    
                    // Aguardar um pouco para garantir que o select foi atualizado
                    setTimeout(() => {
                        const serviceSelect = document.getElementById('appointment-service');
                        if (serviceSelect) {
                            serviceSelect.value = serviceId;
                            
                            // Atualizar o preço no formulário de agendamento
                            const priceInput = document.getElementById('appointment-price');
                            if (priceInput && serviceData.price) {
                                priceInput.value = serviceData.price.toFixed(2).replace('.', ',');
                            }
                        }
                    }, 500);
                    
                    // Mostrar mensagem de sucesso
                    alert('Serviço cadastrado com sucesso!');
                } catch (error) {
                    console.error('Erro ao adicionar serviço:', error);
                    alert('Erro ao cadastrar serviço. Tente novamente.');
                }
            };
        } else {
            alert('O componente de serviços não está disponível. Por favor, tente novamente mais tarde.');
        }
    },
    
    // Método para inicializar o calendário
    initCalendar: function() {
        try {
            const calendarEl = document.getElementById('calendar');
            if (!calendarEl) {
                console.error('Elemento do calendário não encontrado');
                return false;
            }
            
            // Verificar se o FullCalendar está disponível
            if (typeof FullCalendar === 'undefined') {
                console.error('FullCalendar não está disponível');
                return false;
            }
            
            // Garantir que os métodos de callback existam
            const handleDateSelect = typeof this.handleDateSelect === 'function' 
                ? this.handleDateSelect.bind(this) 
                : function() { console.log('Seleção de data não implementada'); };
            
            const handleEventClick = typeof this.handleEventClick === 'function' 
                ? this.handleEventClick.bind(this) 
                : function() { console.log('Clique em evento não implementado'); };
            
            const handleEvents = typeof this.handleEvents === 'function' 
                ? this.handleEvents.bind(this) 
                : function() { console.log('Manipulação de eventos não implementada'); };
            
            // Configurações do calendário - removendo a especificação de plugins
            this.calendar = new FullCalendar.Calendar(calendarEl, {
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
                weekNumbers: true,
                weekNumberCalculation: 'ISO',
                weekText: 'Sem',
                navLinks: true,
                
                // Configurar para mostrar todas as horas do dia
                slotMinTime: '00:00',
                slotMaxTime: '24:00',
                
                // Opcional: ajustar a altura dos slots de tempo
                slotDuration: '01:00:00', // 1 hora por slot
                slotLabelInterval: '01:00:00', // Mostrar label a cada 1 hora
                
                // Formato para os rótulos de hora
                slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false // Usar formato 24h
                },
                
                height: 'auto',
                
                // Callbacks
                select: handleDateSelect,
                eventClick: handleEventClick,
                eventsSet: handleEvents
            });
            
            // Renderizar o calendário
            this.calendar.render();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar calendário:', error);
            return false;
        }
    },
    
    // Método para lidar com seleção de data
    handleDateSelect: function(selectInfo) {
        try {
            console.log('Seleção de data:', selectInfo);
            
            // Verificar se temos informações de seleção válidas
            if (!selectInfo || (!selectInfo.start && !selectInfo.startStr)) {
                console.error('Informações de seleção inválidas');
                this.openAppointmentModal(); // Abrir modal sem datas específicas
                return;
            }
            
            // Obter datas de início e fim
            let startDate = selectInfo.start || new Date(selectInfo.startStr);
            let endDate = selectInfo.end || new Date(selectInfo.endStr);
            
            // Verificar se as datas são válidas
            if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
                console.warn('Data de início inválida, usando data atual');
                startDate = new Date();
            }
            
            if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
                console.warn('Data de fim inválida, usando data atual + 1 hora');
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
            
            // Abrir modal para criar novo compromisso
            this.openAppointmentModal(startDate, endDate);
        } catch (error) {
            console.error('Erro ao processar seleção de data:', error);
            // Abrir modal sem datas específicas em caso de erro
            this.openAppointmentModal();
        }
    },

    // Método para lidar com clique em evento
    handleEventClick: function(clickInfo) {
        // Obter ID do compromisso
        const appointmentId = parseInt(clickInfo.event.id);
        
        // Abrir modal para editar compromisso existente
        this.openAppointmentModal(null, null, appointmentId);
    },

    // Método para lidar com eventos definidos
    handleEvents: function(events) {
        // Este método é chamado quando os eventos são definidos/atualizados
        // Pode ser usado para atualizar contadores, etc.
        console.log('Eventos atualizados:', events.length);
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
    
    // Método para carregar compromissos
    loadAppointments: function() {
        return new Promise((resolve, reject) => {
            try {
                // Verificar se o calendário foi inicializado
                if (!this.calendar) {
                    console.error('Calendário não inicializado');
                    reject(new Error('Calendário não inicializado'));
                    return;
                }
                
                // Verificar se o método addAppointmentToCalendar existe
                if (typeof this.addAppointmentToCalendar !== 'function') {
                    console.error('Método addAppointmentToCalendar não definido');
                    reject(new Error('Método addAppointmentToCalendar não definido'));
                    return;
                }
                
                // Limpar eventos existentes
                this.calendar.removeAllEvents();
                
                // Obter intervalo de datas visível no calendário
                const calendarApi = this.calendar.view;
                let startDate, endDate;
                
                // Verificar se temos acesso às datas do calendário
                if (calendarApi && calendarApi.activeStart && calendarApi.activeEnd) {
                    startDate = calendarApi.activeStart;
                    endDate = calendarApi.activeEnd;
                } else {
                    // Usar datas padrão se não conseguirmos obter do calendário
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Primeiro dia do mês atual
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último dia do mês atual
                }
                
                // Garantir que temos objetos Date válidos
                if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
                    startDate = new Date();
                    startDate.setDate(1); // Primeiro dia do mês atual
                }
                
                if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
                    endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 1, 0); // Último dia do mês atual
                }
                
                // Converter para ISO string para consulta
                const startDateISO = startDate.toISOString();
                const endDateISO = endDate.toISOString();
                
                // Buscar compromissos no banco de dados
                DB.appointments.getAll() // Usar getAll em vez de getByDateRange para simplificar
                    .then(appointments => {
                        // Adicionar eventos ao calendário
                        if (Array.isArray(appointments)) {
                            appointments.forEach(appointment => {
                                try {
                                    this.addAppointmentToCalendar(appointment);
                                } catch (error) {
                                    console.error('Erro ao adicionar compromisso ao calendário:', error, appointment);
                                    // Continuar com o próximo compromisso
                                }
                            });
                        }
                        
                        resolve(appointments);
                    })
                    .catch(error => {
                        console.error('Erro ao buscar compromissos:', error);
                        reject(error);
                    });
            } catch (error) {
                console.error('Erro ao carregar compromissos:', error);
                reject(error);
            }
        });
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
        try {
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
            
            // Carregar clientes e serviços atualizados
            Promise.all([this.loadClients(), this.loadServices()])
                .then(() => {
                    // Mostrar modal
                    this.elements.appointmentModal.style.display = 'block';
                })
                .catch(error => {
                    console.error('Erro ao carregar dados para o modal:', error);
                    // Mostrar modal mesmo com erro
                    this.elements.appointmentModal.style.display = 'block';
                });
        } catch (error) {
            console.error('Erro ao abrir modal de compromisso:', error);
            // Tentar abrir o modal mesmo com erro
            if (this.elements.appointmentModal) {
                this.elements.appointmentModal.style.display = 'block';
            }
        }
    },
    
    // Método para carregar dados do compromisso no formulário
    loadAppointmentData: function(appointment) {
        try {
            if (!appointment) {
                console.error('Dados do compromisso não fornecidos');
                return;
            }
            
            // Obter elementos do formulário
            const titleInput = document.getElementById('appointment-title');
            const clientSelect = document.getElementById('appointment-client');
            const serviceSelect = document.getElementById('appointment-service');
            const dateInput = document.getElementById('appointment-date');
            const startTimeInput = document.getElementById('appointment-start-time');
            const endTimeInput = document.getElementById('appointment-end-time');
            const priceInput = document.getElementById('appointment-price');
            const statusSelect = document.getElementById('appointment-status');
            const notesInput = document.getElementById('appointment-notes');
            
            // Definir valores, com verificação de nulos
            if (titleInput) titleInput.value = appointment.title || '';
            
            // Cliente (opcional)
            if (clientSelect) {
                if (appointment.clientId) {
                    // Verificar se o cliente existe no select
                    let clientExists = false;
                    for (let i = 0; i < clientSelect.options.length; i++) {
                        if (clientSelect.options[i].value == appointment.clientId) {
                            clientSelect.value = appointment.clientId;
                            clientExists = true;
                            break;
                        }
                    }
                    
                    // Se o cliente não existir no select, selecionar a opção vazia
                    if (!clientExists) {
                        clientSelect.value = '';
                        console.warn('Cliente não encontrado no select:', appointment.clientId);
                    }
                } else {
                    clientSelect.value = '';
                }
            }
            
            // Serviço (opcional)
            if (serviceSelect) {
                if (appointment.serviceId) {
                    // Verificar se o serviço existe no select
                    let serviceExists = false;
                    for (let i = 0; i < serviceSelect.options.length; i++) {
                        if (serviceSelect.options[i].value == appointment.serviceId) {
                            serviceSelect.value = appointment.serviceId;
                            serviceExists = true;
                            break;
                        }
                    }
                    
                    // Se o serviço não existir no select, selecionar a opção vazia
                    if (!serviceExists) {
                        serviceSelect.value = '';
                        console.warn('Serviço não encontrado no select:', appointment.serviceId);
                    }
                } else {
                    serviceSelect.value = '';
                }
            }
            
            // Data e hora
            if (dateInput) dateInput.value = appointment.date || '';
            if (startTimeInput) startTimeInput.value = appointment.startTime || '';
            if (endTimeInput) endTimeInput.value = appointment.endTime || '';
            
            // Preço (opcional)
            if (priceInput) {
                if (appointment.price) {
                    // Formatar preço como moeda brasileira
                    const formattedPrice = typeof appointment.price === 'number' 
                        ? appointment.price.toFixed(2).replace('.', ',')
                        : appointment.price.toString().replace('.', ',');
                    
                    priceInput.value = formattedPrice;
                } else {
                    priceInput.value = '';
                }
            }
            
            // Status
            if (statusSelect) statusSelect.value = appointment.status || 'agendado';
            
            // Notas
            if (notesInput) notesInput.value = appointment.notes || '';
            
        } catch (error) {
            console.error('Erro ao carregar dados do compromisso:', error);
        }
    },
    
    // Método para salvar compromisso
    saveAppointment: function(appointmentId = null) {
        try {
            // Obter elementos do formulário
            const titleInput = document.getElementById('appointment-title');
            const clientSelect = document.getElementById('appointment-client');
            const serviceSelect = document.getElementById('appointment-service');
            const dateInput = document.getElementById('appointment-date');
            const startTimeInput = document.getElementById('appointment-start-time');
            const endTimeInput = document.getElementById('appointment-end-time');
            const priceInput = document.getElementById('appointment-price');
            const statusSelect = document.getElementById('appointment-status');
            const notesInput = document.getElementById('appointment-notes');
            
            // Verificar se os elementos essenciais existem
            if (!titleInput || !dateInput || !startTimeInput) {
                console.error('Elementos essenciais do formulário não encontrados');
                alert('Erro ao salvar: formulário incompleto');
                return Promise.reject(new Error('Elementos essenciais do formulário não encontrados'));
            }
            
            // Obter valores, com verificação de nulos
            const title = titleInput ? titleInput.value.trim() : '';
            
            // Cliente e serviço são opcionais
            let clientId = null;
            if (clientSelect && clientSelect.value) {
                const clientValue = parseInt(clientSelect.value);
                if (!isNaN(clientValue)) {
                    clientId = clientValue;
                }
            }
            
            let serviceId = null;
            if (serviceSelect && serviceSelect.value) {
                const serviceValue = parseInt(serviceSelect.value);
                if (!isNaN(serviceValue)) {
                    serviceId = serviceValue;
                }
            }
            
            const date = dateInput ? dateInput.value : '';
            const startTime = startTimeInput ? startTimeInput.value : '';
            const endTime = endTimeInput ? endTimeInput.value : '';
            
            // Preço é opcional
            let price = 0;
            if (priceInput && priceInput.value) {
                const priceValue = parseFloat(priceInput.value.replace(',', '.'));
                if (!isNaN(priceValue)) {
                    price = priceValue;
                }
            }
            
            const status = statusSelect ? statusSelect.value : 'agendado';
            const notes = notesInput ? notesInput.value.trim() : '';
            
            // Validar dados obrigatórios
            if (!title) {
                alert('Por favor, informe um nome para o compromisso');
                if (titleInput) titleInput.focus();
                return Promise.reject(new Error('Nome do compromisso não informado'));
            }
            
            if (!date) {
                alert('Por favor, selecione uma data');
                if (dateInput) dateInput.focus();
                return Promise.reject(new Error('Data não informada'));
            }
            
            if (!startTime) {
                alert('Por favor, informe o horário de início');
                if (startTimeInput) startTimeInput.focus();
                return Promise.reject(new Error('Horário de início não informado'));
            }
            
            // Criar objeto de compromisso
            const appointment = {
                title: title,
                clientId: clientId,
                serviceId: serviceId,
                date: date,
                startTime: startTime,
                endTime: endTime || startTime, // Se não houver horário de término, usar o de início
                price: price,
                status: status,
                notes: notes
            };
            
            // Se for edição, incluir o ID
            if (appointmentId) {
                appointment.id = parseInt(appointmentId);
            }
            
            // Salvar no banco de dados
            if (appointmentId) {
                return DB.appointments.update(appointment)
                    .then(() => {
                        // Atualizar calendário
                        this.refreshEvents();
                        
                        // Fechar modal
                        if (this.elements.appointmentModal) {
                            this.elements.appointmentModal.style.display = 'none';
                        }
                        
                        return appointment;
                    });
            } else {
                return DB.appointments.add(appointment)
                    .then((id) => {
                        // Atualizar calendário
                        this.refreshEvents();
                        
                        // Fechar modal
                        if (this.elements.appointmentModal) {
                            this.elements.appointmentModal.style.display = 'none';
                        }
                        
                        appointment.id = id;
                        return appointment;
                    });
            }
        } catch (error) {
            console.error('Erro ao salvar compromisso:', error);
            alert('Erro ao salvar compromisso. Tente novamente.');
            return Promise.reject(error);
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
        try {
            // Verificar se date é uma string
            if (typeof date === 'string') {
                // Tentar converter para objeto Date
                date = new Date(date);
            }
            
            // Verificar se date é um objeto Date válido
            if (!(date instanceof Date) || isNaN(date.getTime())) {
                console.warn('Data inválida:', date);
                // Retornar data atual formatada
                const now = new Date();
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            // Retornar data atual formatada em caso de erro
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
    },
    
    // Formatar hora para input type="time"
    formatTimeForInput: function(date) {
        try {
            // Verificar se date é uma string
            if (typeof date === 'string') {
                // Tentar converter para objeto Date
                date = new Date(date);
            }
            
            // Verificar se date é um objeto Date válido
            if (!(date instanceof Date) || isNaN(date.getTime())) {
                console.warn('Data inválida para formatação de hora:', date);
                // Retornar hora atual formatada
                const now = new Date();
                return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            }
            
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (error) {
            console.error('Erro ao formatar hora:', error);
            // Retornar hora atual formatada em caso de erro
            const now = new Date();
            return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
    },
    
    // Método para lidar com clique em evento do calendário
    handleEventClick: function(info) {
        const event = info.event;
        const appointmentId = parseInt(event.id);
        
        // Usar as extensões para mostrar detalhes do compromisso
        if (typeof AgendaExtensions !== 'undefined') {
            AgendaExtensions.showAppointmentDetails(appointmentId);
        } else {
            // Fallback para o comportamento padrão (abrir para edição)
            this.openAppointmentModal(null, null, appointmentId);
        }
    },

    // Adicionar método para excluir compromisso
    deleteAppointment: function(appointmentId) {
        if (confirm('Tem certeza que deseja excluir este compromisso?')) {
            DB.appointments.delete(appointmentId)
                .then(() => {
                    // Remover o evento do calendário
                    const event = this.calendar.getEventById(appointmentId.toString());
                    if (event) {
                        event.remove();
                    }
                
                    // Mostrar mensagem de sucesso
                    alert('Compromisso excluído com sucesso!');
                
                    // Recarregar compromissos (opcional, se preferir atualizar tudo)
                    // this.loadAppointments();
                })
                .catch(error => {
                    console.error('Erro ao excluir compromisso:', error);
                    alert('Erro ao excluir compromisso. Tente novamente.');
                });
        }
    },

    // Método para adicionar compromisso ao calendário
    addAppointmentToCalendar: function(appointment) {
        if (!this.calendar) {
            console.error('Calendário não inicializado');
            return;
        }
        
        if (!appointment || !appointment.id) {
            console.error('Compromisso inválido:', appointment);
            return;
        }
        
        // Verificar se já existe um evento com este ID
        const existingEvent = this.calendar.getEventById(appointment.id.toString());
        if (existingEvent) {
            existingEvent.remove(); // Remover para evitar duplicação
        }
        
        // Definir cor do evento com base no status
        let backgroundColor = '#3788d8'; // Cor padrão (azul)
        let borderColor = '#3788d8';
        let textColor = '#ffffff';
        
        if (appointment.status === 'concluido') {
            backgroundColor = '#28a745'; // Verde para concluído
            borderColor = '#28a745';
        } else if (appointment.status === 'cancelado') {
            backgroundColor = '#dc3545'; // Vermelho para cancelado
            borderColor = '#dc3545';
        }
        
        // Criar evento para o calendário
        const eventData = {
            id: appointment.id.toString(),
            title: appointment.title || 'Sem título',
            start: appointment.startDate,
            end: appointment.endDate,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            textColor: textColor,
            extendedProps: {
                clientId: appointment.clientId,
                serviceId: appointment.serviceId,
                price: appointment.price,
                location: appointment.location,
                notes: appointment.notes,
                status: appointment.status
            }
        };
        
        // Adicionar evento ao calendário
        this.calendar.addEvent(eventData);
    },

    // Método para converter compromisso em evento do calendário
    convertAppointmentToEvent: function(appointment) {
        try {
            if (!appointment || !appointment.date || !appointment.startTime) {
                console.warn('Dados de compromisso inválidos:', appointment);
                return null;
            }
            
            // Criar data de início
            const startDate = new Date(`${appointment.date}T${appointment.startTime}`);
            
            // Criar data de término
            let endDate;
            if (appointment.endTime) {
                endDate = new Date(`${appointment.date}T${appointment.endTime}`);
                
                // Se a data de término for anterior à de início, assumir que é no dia seguinte
                if (endDate < startDate) {
                    endDate.setDate(endDate.getDate() + 1);
                }
            } else {
                // Se não houver hora de término, definir como 1 hora após o início
                endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 1);
            }
            
            // Determinar cor com base no status
            let backgroundColor = '#3788d8'; // Azul padrão
            let borderColor = '#3788d8';
            let textColor = '#ffffff';
            
            switch (appointment.status) {
                case 'concluido':
                    backgroundColor = '#28a745'; // Verde
                    borderColor = '#28a745';
                    break;
                case 'cancelado':
                    backgroundColor = '#dc3545'; // Vermelho
                    borderColor = '#dc3545';
                    break;
            }
            
            // Criar evento
            const event = {
                id: appointment.id,
                title: appointment.title || 'Sem título', // Usar o título do compromisso
                start: startDate,
                end: endDate,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                textColor: textColor,
                extendedProps: {
                    clientId: appointment.clientId,
                    serviceId: appointment.serviceId,
                    price: appointment.price,
                    status: appointment.status,
                    notes: appointment.notes
                }
            };
            
            return event;
        } catch (error) {
            console.error('Erro ao converter compromisso para evento:', error);
            return null;
        }
    },
    // No método init ou em um método separado que é chamado após carregar o template
    ensureTitleFieldExists: function() {
        // Verificar se o campo de título já existe
        if (!document.getElementById('appointment-title')) {
            // Encontrar o formulário
            const form = document.getElementById('appointment-form');
            if (form) {
                // Criar o campo de título
                const titleGroup = document.createElement('div');
                titleGroup.className = 'form-group';
                titleGroup.innerHTML = `
                    <label for="appointment-title">Nome do Compromisso</label>
                    <input type="text" id="appointment-title" required>
                `;
            
                // Inserir como primeiro elemento do formulário (após o input hidden)
                const firstChild = form.querySelector('.form-group');
                if (firstChild) {
                    form.insertBefore(titleGroup, firstChild);
                } else {
                    form.appendChild(titleGroup);
                }
            
                console.log('Campo de título adicionado ao formulário de compromisso');
            }
        }
    
        // Atualizar os labels de cliente e serviço para indicar que são opcionais
        const clientLabel = document.querySelector('label[for="appointment-client"]');
        if (clientLabel) {
            clientLabel.textContent = 'Cliente (opcional)';
        }
    
        const serviceLabel = document.querySelector('label[for="appointment-service"]');
        if (serviceLabel) {
            serviceLabel.textContent = 'Serviço (opcional)';
        }
    }
};
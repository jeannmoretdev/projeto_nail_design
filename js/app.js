document.addEventListener('DOMContentLoaded', () => {
    // Função para aplicar configurações salvas
    function applyStoredSettings() {
        try {
            const settings = localStorage.getItem('appSettings');
            
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                
                // Aplicar tema
                if (parsedSettings.theme) {
                    document.body.className = '';
                    document.body.classList.add(`theme-${parsedSettings.theme}`);
                }
                
                // Aplicar tamanho da fonte
                if (parsedSettings.fontSize) {
                    const rootElement = document.documentElement;
                    
                    switch (parsedSettings.fontSize) {
                        case 'small':
                            rootElement.style.setProperty('--base-font-size', '14px');
                            break;
                        case 'medium':
                            rootElement.style.setProperty('--base-font-size', '16px');
                            break;
                        case 'large':
                            rootElement.style.setProperty('--base-font-size', '18px');
                            break;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao aplicar configurações salvas:', error);
        }
    }

    // Função para inicializar dados de exemplo
    function initSampleData() {
        return new Promise((resolve, reject) => {
            // Verificar se já existem dados
            Promise.all([
                DB.clients.getAll(),
                DB.services.getAll()
            ])
                .then(([clients, services]) => {
                    if (clients.length === 0 && services.length === 0) {
                        console.log('Nenhum dado encontrado. Importando dados de exemplo...');
                        
                        // Carregar arquivo de exemplo
                        fetch('assets/sample_import.json')
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`);
                                }
                                return response.json();
                            })
                            .then(sampleData => {
                                // Importar clientes
                                const clientPromises = sampleData.data.clients.map(client => DB.clients.add(client));
                                
                                // Importar serviços
                                const servicePromises = sampleData.data.services.map(service => DB.services.add(service));
                                
                                // Aguardar todas as importações
                                return Promise.all([...clientPromises, ...servicePromises]);
                            })
                            .then(() => {
                                console.log('Dados de exemplo importados com sucesso');
                                
                                // Extrair e salvar categorias personalizadas
                                fetch('assets/sample_import.json')
                                    .then(response => response.json())
                                    .then(sampleData => {
                                        const categories = [...new Set(sampleData.data.services.map(service => service.category))];
                                        localStorage.setItem('customCategories', JSON.stringify(categories));
                                    })
                                    .catch(error => {
                                        console.error('Erro ao salvar categorias personalizadas:', error);
                                    });
                                
                                resolve();
                            })
                            .catch(error => {
                                console.error('Erro ao importar dados de exemplo:', error);
                                resolve(); // Resolve mesmo com erro para não bloquear a aplicação
                            });
                    } else {
                        console.log('Já existem dados no banco de dados');
                        resolve();
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar dados existentes:', error);
                    resolve(); // Resolve mesmo com erro para não bloquear a aplicação
                });
        });
    }

    // Aplicar configurações salvas antes de inicializar componentes
    applyStoredSettings();
    
    // Inicializar o banco de dados
    DB.init()
        .then(() => {
            console.log('Banco de dados inicializado com sucesso');
            
            // Inicializar componentes
            if (typeof Navigation !== 'undefined') {
                Navigation.init();
            }
            
            // Inicializar componente de clientes com tratamento de erro
            if (typeof ClientsComponent !== 'undefined') {
                return ClientsComponent.init()
                    .catch(error => {
                        console.error('Erro ao inicializar componente de clientes:', error);
                        const clientsElement = document.getElementById('clients');
                        if (clientsElement) {
                            clientsElement.innerHTML = `
                                <div class="error-message">
                                    <p>Erro ao carregar o componente de clientes.</p>
                                    <p>Detalhes: ${error.message}</p>
                                </div>
                            `;
                        }
                    });
            }
            return Promise.resolve();
        })
        .then(() => {
            // Inicializar componente de serviços
            if (typeof ServicesComponent !== 'undefined') {
                return ServicesComponent.init()
                    .catch(error => {
                        console.error('Erro ao inicializar componente de serviços:', error);
                        const servicesElement = document.getElementById('services');
                        if (servicesElement) {
                            servicesElement.innerHTML = `
                                <div class="error-message">
                                    <p>Erro ao carregar o componente de serviços.</p>
                                    <p>Detalhes: ${error.message}</p>
                                </div>
                            `;
                        }
                    });
            }
            return Promise.resolve();
        })
        .then(() => {
            // Inicializar componente de configurações
            if (typeof SettingsComponent !== 'undefined') {
                return SettingsComponent.init()
                    .catch(error => {
                        console.error('Erro ao inicializar componente de configurações:', error);
                        const settingsElement = document.getElementById('settings');
                        if (settingsElement) {
                            settingsElement.innerHTML = `
                                <div class="error-message">
                                    <p>Erro ao carregar o componente de configurações.</p>
                                    <p>Detalhes: ${error.message}</p>
                                </div>
                            `;
                        }
                    });
            }
            return Promise.resolve();
        })
        .then(() => {
            // Verificar aniversariantes após 2 segundos
            setTimeout(() => {
                try {
                    if (typeof NotificationsComponent !== 'undefined') {
                        NotificationsComponent.checkBirthdaysThisMonth();
                    }
                } catch (error) {
                    console.error('Erro ao verificar aniversariantes:', error);
                }
            }, 2000);
            
            // Configurar elementos da UI
            setupUIElements();
        })
        .catch(error => {
            console.error('Erro ao inicializar banco de dados:', error);
            alert('Erro ao inicializar o aplicativo. Por favor, recarregue a página.');
        });
    
    // Configurar elementos da UI
    function setupUIElements() {
        // Elementos DOM
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page');
        const addClientBtn = document.getElementById('add-client-btn');
        const clientModal = document.getElementById('client-modal');
        const closeModal = document.querySelector('.close-modal');
        const clientForm = document.getElementById('client-form');
        const cancelBtn = document.querySelector('.btn-cancel');
        const clientSearch = document.getElementById('client-search');
        const clientsList = document.getElementById('clients-list');
        
        // Navegação entre páginas
        if (navButtons.length > 0) {
            navButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetPage = button.dataset.page;
                    
                    // Atualizar botões de navegação
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Mostrar página selecionada
                    pages.forEach(page => {
                        if (page.id === targetPage) {
                            page.classList.add('active');
                        } else {
                            page.classList.remove('active');
                        }
                    });
                });
            });
        }
        
        // Abrir modal para adicionar cliente
        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => {
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'Novo Cliente';
                }
                
                if (clientForm) {
                    clientForm.reset();
                }
                
                const clientIdInput = document.getElementById('client-id');
                if (clientIdInput) {
                    clientIdInput.value = '';
                }
                
                if (clientModal) {
                    clientModal.style.display = 'block';
                }
            });
        }
        
        // Fechar modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (clientModal) {
                    clientModal.style.display = 'none';
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (clientModal) {
                    clientModal.style.display = 'none';
                }
            });
        }
        
        // Fechar modal ao clicar fora
        if (clientModal) {
            window.addEventListener('click', (event) => {
                if (event.target === clientModal) {
                    clientModal.style.display = 'none';
                }
            });
        }
        
        // Formatar entrada de aniversário (DD/MM)
        const birthdayInput = document.getElementById('client-birthday');
        if (birthdayInput) {
            birthdayInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                
                e.target.value = value;
            });
        }
        
        // Salvar cliente
        if (clientForm) {
            clientForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const clientIdInput = document.getElementById('client-id');
                const clientId = clientIdInput ? clientIdInput.value : '';
                
                const client = {
                    name: document.getElementById('client-name') ? document.getElementById('client-name').value : '',
                    phone: document.getElementById('client-phone') ? document.getElementById('client-phone').value : '',
                    birthday: document.getElementById('client-birthday') ? document.getElementById('client-birthday').value : '',
                    location: document.getElementById('client-location') ? document.getElementById('client-location').value : '',
                    services: document.getElementById('client-services') ? document.getElementById('client-services').value : '',
                    notes: document.getElementById('client-notes') ? document.getElementById('client-notes').value : ''
                };
                
                if (clientId) {
                    // Atualizar cliente existente
                    client.id = parseInt(clientId);
                    DB.clients.update(client)
                        .then(() => {
                            if (typeof loadClients === 'function') {
                                loadClients();
                            } else if (typeof ClientsComponent !== 'undefined' && typeof ClientsComponent.loadClients === 'function') {
                                ClientsComponent.loadClients();
                            }
                            
                            if (clientModal) {
                                clientModal.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao atualizar cliente:', error);
                            alert('Erro ao atualizar cliente. Tente novamente.');
                        });
                } else {
                    // Adicionar novo cliente
                    DB.clients.add(client)
                        .then(() => {
                            if (typeof loadClients === 'function') {
                                loadClients();
                            } else if (typeof ClientsComponent !== 'undefined' && typeof ClientsComponent.loadClients === 'function') {
                                ClientsComponent.loadClients();
                            }
                            
                            if (clientModal) {
                                clientModal.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao adicionar cliente:', error);
                            alert('Erro ao adicionar cliente. Tente novamente.');
                        });
                }
            });
        }
        
        // Buscar clientes
        if (clientSearch) {
            clientSearch.addEventListener('input', () => {
                const query = clientSearch.value.trim();
                
                if (typeof loadClients === 'function') {
                    loadClients(query);
                } else if (typeof ClientsComponent !== 'undefined' && typeof ClientsComponent.loadClients === 'function') {
                    ClientsComponent.loadClients(query);
                }
            });
        }
        
        // Adicionar funcionalidade para a máscara de telefone
        const phoneInput = document.getElementById('client-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                if (value.length > 0) {
                    // Formato: (XX) XXXXX-XXXX
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
        }
    }
});
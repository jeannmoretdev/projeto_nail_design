// Extensões para o componente de Agenda
const AgendaExtensions = {
    // Referência ao componente principal
    agendaComponent: null,
    
    // Inicializar extensões
    init: function(agendaComponent) {
        this.agendaComponent = agendaComponent;
        
        // Configurar selects de cliente e serviço
        this.setupClientSelect();
        this.setupServiceSelect();
        
        // Configurar eventos personalizados
        this.setupCustomEvents();
        
        return this;
    },
    
    // Configurar eventos personalizados
    setupCustomEvents: function() {
        const self = this;
        
        // Adicionar ouvintes para eventos personalizados
        document.addEventListener('show-appointment-details', (event) => {
            if (event.detail && event.detail.appointmentId) {
                self.showAppointmentDetails(event.detail.appointmentId);
            }
        });
        
        document.addEventListener('edit-appointment', (event) => {
            if (event.detail && event.detail.appointmentId) {
                self.agendaComponent.openAppointmentModal(null, null, event.detail.appointmentId);
            }
        });
        
        document.addEventListener('delete-appointment', (event) => {
            if (event.detail && event.detail.appointmentId) {
                self.deleteAppointment(event.detail.appointmentId);
            }
        });
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
    
    // Método para mostrar detalhes do compromisso
    showAppointmentDetails: function(appointmentId) {
        // Buscar detalhes do compromisso no banco de dados
        DB.appointments.getById(appointmentId)
            .then(appointment => {
                if (!appointment) {
                    console.error('Compromisso não encontrado:', appointmentId);
                    return;
                }
                
                // Preencher os campos do modal de detalhes
                document.getElementById('detail-title').textContent = appointment.title || 'Sem título';
                
                // Buscar nome do cliente
                if (appointment.clientId) {
                    DB.clients.getById(appointment.clientId)
                        .then(client => {
                            document.getElementById('detail-client').textContent = client ? client.name : 'Cliente não encontrado';
                        })
                        .catch(error => {
                            console.error('Erro ao buscar cliente:', error);
                            document.getElementById('detail-client').textContent = 'Erro ao buscar cliente';
                        });
                } else {
                    document.getElementById('detail-client').textContent = 'Nenhum cliente selecionado';
                }
                
                // Buscar nome do serviço
                if (appointment.serviceId) {
                    DB.services.getById(appointment.serviceId)
                        .then(service => {
                            document.getElementById('detail-service').textContent = service ? service.name : 'Serviço não encontrado';
                        })
                        .catch(error => {
                            console.error('Erro ao buscar serviço:', error);
                            document.getElementById('detail-service').textContent = 'Erro ao buscar serviço';
                        });
                } else {
                    document.getElementById('detail-service').textContent = 'Nenhum serviço selecionado';
                }
                
                // Formatar data e hora
                const startDate = new Date(appointment.startDate);
                const endDate = new Date(appointment.endDate);
                
                const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit' };
                
                const formattedDate = startDate.toLocaleDateString('pt-BR', dateOptions);
                const formattedStartTime = startDate.toLocaleTimeString('pt-BR', timeOptions);
                const formattedEndTime = endDate.toLocaleTimeString('pt-BR', timeOptions);
                
                document.getElementById('detail-datetime').textContent = `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
                
                // Calcular e mostrar duração
                const durationMinutes = AgendaUtils.calculateDurationInMinutes(startDate, endDate);
                document.getElementById('detail-duration').textContent = AgendaUtils.formatDuration(durationMinutes);
                
                // Mostrar preço
                if (appointment.price) {
                    let formattedPrice = '';
                    if (typeof appointment.price === 'number') {
                        formattedPrice = `R$ ${appointment.price.toFixed(2).replace('.', ',')}`;
                    } else {
                        formattedPrice = appointment.price.includes('R$') ? appointment.price : `R$ ${appointment.price}`;
                    }
                    document.getElementById('detail-price').textContent = formattedPrice;
                } else {
                    document.getElementById('detail-price').textContent = 'Não informado';
                }
                
                // Mostrar local
                if (appointment.location) {
                    document.getElementById('detail-location').textContent = appointment.location === 'salao' ? 'Salão' : 'Domicílio';
                } else {
                    document.getElementById('detail-location').textContent = 'Não informado';
                }
                
                // Mostrar status
                let statusText = 'Agendado';
                if (appointment.status === 'concluido') {
                    statusText = 'Concluído';
                } else if (appointment.status === 'cancelado') {
                    statusText = 'Cancelado';
                }
                document.getElementById('detail-status').textContent = statusText;
                
                // Mostrar observações
                document.getElementById('detail-notes').textContent = appointment.notes || 'Nenhuma observação';
                
                // Configurar botões de ação
                const actionButtons = document.querySelector('.appointment-action-buttons');
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" class="btn-edit-appointment">Editar</button>
                        <button type="button" class="btn-delete-appointment">Excluir</button>
                        <button type="button" class="btn-close-details">Fechar</button>
                    `;
                    
                    // Adicionar evento ao botão de edição
                    const editBtn = actionButtons.querySelector('.btn-edit-appointment');
                    if (editBtn) {
                        editBtn.addEventListener('click', () => {
                            this.agendaComponent.openAppointmentModal(null, null, appointment.id);
                            document.getElementById('appointment-details-modal').style.display = 'none';
                        });
                    }
                    
                    // Adicionar evento ao botão de exclusão
                    const deleteBtn = actionButtons.querySelector('.btn-delete-appointment');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            this.deleteAppointment(appointment.id);
                            document.getElementById('appointment-details-modal').style.display = 'none';
                        });
                    }
                    
                    // Adicionar evento ao botão de fechar
                    const closeBtn = actionButtons.querySelector('.btn-close-details');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            document.getElementById('appointment-details-modal').style.display = 'none';
                        });
                    }
                }
                
                // Mostrar o modal de detalhes
                const detailsModal = document.getElementById('appointment-details-modal');
                if (detailsModal) {
                    detailsModal.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes do compromisso:', error);
                alert('Erro ao carregar detalhes do compromisso. Tente novamente.');
            });
    },
    
    // Método para excluir compromisso
    deleteAppointment: function(appointmentId) {
        if (confirm('Tem certeza que deseja excluir este compromisso?')) {
            DB.appointments.delete(appointmentId)
                .then(() => {
                    // Remover o evento do calendário
                    if (this.agendaComponent && this.agendaComponent.calendar) {
                        const event = this.agendaComponent.calendar.getEventById(appointmentId.toString());
                        if (event) {
                            event.remove();
                        }
                    }
                    
                    // Mostrar mensagem de sucesso
                    alert('Compromisso excluído com sucesso!');
                    
                    // Recarregar compromissos (opcional, se preferir atualizar tudo)
                    if (this.agendaComponent && typeof this.agendaComponent.loadAppointments === 'function') {
                        this.agendaComponent.loadAppointments();
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir compromisso:', error);
                    alert('Erro ao excluir compromisso. Tente novamente.');
                });
        }
    },
    
    // Método para atualizar o select de clientes
    updateClientSelect: function(selectedClientId = null) {
        const clientSelect = document.getElementById('appointment-client');
        if (!clientSelect) return;
        
        // Salvar o valor selecionado atualmente (se não for fornecido)
        if (selectedClientId === null && clientSelect.value && clientSelect.value !== 'new') {
            selectedClientId = clientSelect.value;
        }
        
        // Carregar clientes existentes
        DB.clients.getAll()
            .then(clients => {
                // Ordenar clientes por nome
                clients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                
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
                
                // Restaurar valor selecionado
                if (selectedClientId) {
                    clientSelect.value = selectedClientId;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar clientes:', error);
            });
    },
    
    // Método para atualizar o select de serviços
    updateServiceSelect: function(selectedServiceId = null) {
        const serviceSelect = document.getElementById('appointment-service');
        if (!serviceSelect) return;
        
        // Salvar o valor selecionado atualmente (se não for fornecido)
        if (selectedServiceId === null && serviceSelect.value && serviceSelect.value !== 'new') {
            selectedServiceId = serviceSelect.value;
        }
        
        // Carregar serviços existentes
        DB.services.getAll()
            .then(services => {
                // Ordenar serviços por nome
                services.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                
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
                        option.textContent += ` - R$ ${typeof service.price === 'number' ? service.price.toFixed(2).replace('.', ',') : service.price}`;
                    }
                    serviceSelect.appendChild(option);
                });
                
                // Adicionar opção para novo serviço
                const newServiceOption = document.createElement('option');
                newServiceOption.value = 'new';
                newServiceOption.textContent = '+ Cadastrar Novo Serviço';
                newServiceOption.className = 'new-item-option';
                serviceSelect.appendChild(newServiceOption);
                
                // Restaurar valor selecionado
                if (selectedServiceId) {
                    serviceSelect.value = selectedServiceId;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar serviços:', error);
            });
    }
};
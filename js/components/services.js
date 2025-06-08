// Componente de Serviços - Versão com gerenciamento de categorias separado
const ServicesComponent = {
    // Elementos DOM
    elements: {
        addServiceBtn: null,
        serviceModal: null,
        closeModal: null,
        serviceForm: null,
        cancelBtn: null,
        serviceSearch: null,
        servicesList: null,
        priceInput: null,
        categorySelect: null
    },
    
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template usando o sistema existente
            document.getElementById('services').innerHTML = servicesTemplate;
            
            // Inicializar elementos DOM após carregar o template
            this.initElements();
            
            // Inicializar componente de categorias
            if (!CategoriesComponent.init(this.onCategoriesUpdated.bind(this))) {
                console.error('Erro ao inicializar componente de categorias');
            }
            
            // Adicionar botão de gerenciamento de categorias
            CategoriesComponent.addManagementButton(document.querySelector('.page-header'));
            
            // Atualizar o select de categorias
            this.updateCategorySelect(CategoriesComponent.getCategories());
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Carregar dados
            this.loadServices();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de serviços:', error);
            document.getElementById('services').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar o componente de serviços.</p>
                    <p>Detalhes: ${error.message}</p>
                </div>
            `;
            return false;
        }
    },
    
    // Inicializar referências aos elementos DOM
    initElements: function() {
        this.elements = {
            addServiceBtn: document.getElementById('add-service-btn'),
            serviceModal: document.getElementById('service-modal'),
            closeModal: document.querySelector('#service-modal .close-modal'),
            serviceForm: document.getElementById('service-form'),
            cancelBtn: document.querySelector('#service-modal .btn-cancel'),
            serviceSearch: document.getElementById('service-search'),
            servicesList: document.getElementById('services-list'),
            priceInput: document.getElementById('service-price'),
            categorySelect: document.getElementById('service-category')
        };
        
        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`Elemento '${key}' não encontrado no DOM`);
            }
        }
    },
    
    // Callback para quando as categorias são atualizadas
    onCategoriesUpdated: function(categories) {
        this.updateCategorySelect(categories);
        this.loadServices(); // Recarregar serviços para refletir mudanças de categoria
    },
    
    // Atualizar o select de categorias
    updateCategorySelect: function(categories) {
        if (!this.elements.categorySelect) return;
        
        // Limpar todas as opções existentes
        this.elements.categorySelect.innerHTML = '';
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione uma categoria';
        this.elements.categorySelect.appendChild(defaultOption);
        
        // Adicionar categorias
        if (Array.isArray(categories)) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                this.elements.categorySelect.appendChild(option);
            });
        }
        
        // Adicionar opção "Nova categoria"
        const newCategoryOption = document.createElement('option');
        newCategoryOption.value = 'nova_categoria';
        newCategoryOption.textContent = '+ Nova categoria';
        this.elements.categorySelect.appendChild(newCategoryOption);
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        const self = this;
        
        if (this.elements.addServiceBtn) {
            this.elements.addServiceBtn.addEventListener('click', function() {
                document.getElementById('modal-title').textContent = 'Novo Serviço';
                self.elements.serviceForm.reset();
                document.getElementById('service-id').value = '';
                self.elements.serviceModal.style.display = 'block';
            });
        }
        
        // Fechar modal
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', (event) => {
                event.preventDefault(); // Prevenir comportamento padrão
                if (this.elements.serviceModal) {
                    this.elements.serviceModal.style.display = 'none';
                }
            });
        }
        
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', (event) => {
                event.preventDefault(); // Prevenir comportamento padrão
                if (this.elements.serviceModal) {
                    this.elements.serviceModal.style.display = 'none';
                }
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            if (self.elements.serviceModal && event.target === self.elements.serviceModal) {
                self.elements.serviceModal.style.display = 'none';
            }
        });
        
        // Mostrar/ocultar campo de nova categoria
        if (this.elements.categorySelect) {
            this.elements.categorySelect.addEventListener('change', function() {
                if (this.value === 'nova_categoria') {
                    // Em vez de mostrar o grupo de nova categoria, mostrar um prompt
                    const newCategory = prompt('Digite o nome da nova categoria:');
                    if (newCategory && newCategory.trim()) {
                        // Verificar se a categoria já existe
                        const categories = CategoriesComponent.getCategories();
                        if (categories.includes(newCategory.trim())) {
                            alert('Esta categoria já existe.');
                            self.elements.categorySelect.value = '';
                            return;
                        }
                        
                        // Adicionar nova categoria
                        CategoriesComponent.categories.push(newCategory.trim());
                        CategoriesComponent.saveCategories();
                        
                        // Atualizar dropdown e selecionar a nova categoria
                        self.updateCategorySelect(CategoriesComponent.getCategories());
                        self.elements.categorySelect.value = newCategory.trim();
                    } else {
                        // Se o usuário cancelar, voltar para a primeira opção
                        self.elements.categorySelect.value = '';
                    }
                }
            });
        }
        
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
            
            // Ao perder o foco, garantir que o formato está correto
            this.elements.priceInput.addEventListener('blur', function(e) {
                let value = e.target.value;
                
                if (value) {
                    // Se não tiver vírgula, adicionar ,00
                    if (!value.includes(',')) {
                        value += ',00';
                    } else {
                        // Se tiver vírgula, garantir que tem 2 casas decimais
                        const parts = value.split(',');
                        if (parts[1].length === 1) {
                            value += '0';
                        }
                    }
                    
                    e.target.value = value;
                }
            });
        }
        
        // Salvar serviço
        if (this.elements.serviceForm) {
            this.elements.serviceForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const serviceId = document.getElementById('service-id').value;
                
                // Obter categoria
                let category = '';
                const categorySelect = document.getElementById('service-category');

                if (categorySelect) {
                    category = categorySelect.value;
                    
                    // Se for "nova_categoria", já foi tratado no evento change
                    if (category === 'nova_categoria') {
                        alert('Por favor, selecione uma categoria válida.');
                        return;
                    }
                }
                
                // Converter preço para formato numérico
                let price = document.getElementById('service-price').value;
                if (price) {
                    // Substituir vírgula por ponto e converter para número
                    price = parseFloat(price.replace(',', '.'));
                } else {
                    price = 0;
                }
                
                const service = {
                    name: document.getElementById('service-name').value || '',
                    category: category,
                    price: price,
                    description: document.getElementById('service-description').value || ''
                };
                
                // Verificar se pelo menos nome e categoria foram preenchidos
                if (!service.name) {
                    alert('Por favor, informe o nome do serviço.');
                    document.getElementById('service-name').focus();
                    return;
                }
                
                if (serviceId) {
                    // Atualizar serviço existente
                    service.id = parseInt(serviceId);
                    DB.services.update(service)
                        .then(() => {
                            self.loadServices();
                            self.elements.serviceModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('Erro ao atualizar serviço:', error);
                            alert('Erro ao atualizar serviço. Tente novamente.');
                        });
                } else {
                    // Adicionar novo serviço
                    DB.services.add(service)
                        .then(() => {
                            self.loadServices();
                            self.elements.serviceModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('Erro ao adicionar serviço:', error);
                            alert('Erro ao adicionar serviço. Tente novamente.');
                        });
                }
            });
        }
        
        // Buscar serviços
        if (this.elements.serviceSearch) {
            this.elements.serviceSearch.addEventListener('input', function() {
                const query = self.elements.serviceSearch.value.trim();
                self.loadServices(query);
            });
        }
    },
    
    // Carregar lista de serviços
    loadServices: function(query = '') {
        if (!this.elements.servicesList) {
            console.error('Lista de serviços não encontrada no DOM');
            return;
        }
        
        DB.services.search(query)
            .then(services => {
                if (!services || !Array.isArray(services)) {
                    services = [];
                }
                
                const sortedServices = this.sortServicesByName(services);
                this.renderServicesList(sortedServices);
            })
            .catch(error => {
                console.error('Erro ao buscar serviços:', error);
                this.elements.servicesList.innerHTML = '<p class="error-message">Erro ao carregar serviços</p>';
            });
    },
    
    // Renderizar lista de serviços
    renderServicesList: function(services) {
        if (!this.elements.servicesList) {
            console.error('Lista de serviços não encontrada no DOM');
            return;
        }
        
        if (!services || services.length === 0) {
            this.elements.servicesList.innerHTML = '<p class="empty-message">Nenhum serviço encontrado</p>';
            return;
        }
        
        this.elements.servicesList.innerHTML = '';
        
        services.forEach(service => {
            const serviceCard = this.renderServiceCard(service);
            
            this.elements.servicesList.appendChild(serviceCard);
            
            // Adicionar evento para expandir/recolher detalhes
            const serviceInfo = serviceCard.querySelector('.service-info');
            const serviceDetails = serviceCard.querySelector('.service-details');
            
            if (serviceInfo && serviceDetails) {
                serviceInfo.addEventListener('click', () => {
                    serviceDetails.classList.toggle('active');
                });
            }
            
            // Adicionar eventos aos botões de editar e excluir
            const editBtn = serviceCard.querySelector('.edit-btn');
            const deleteBtn = serviceCard.querySelector('.delete-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const serviceId = parseInt(serviceCard.dataset.id);
                    this.editService(serviceId);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const serviceId = parseInt(serviceCard.dataset.id);
                    this.deleteService(serviceId);
                });
            }
        });
    },
    
    // Renderizar card de serviço
    renderServiceCard: function(service) {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.dataset.id = service.id;
        
        // Formatar preço
        let formattedPrice = 'Preço não informado';
        if (service.price) {
            if (typeof service.price === 'number') {
                formattedPrice = `R$ ${service.price.toFixed(2).replace('.', ',')}`;
            } else if (typeof service.price === 'string') {
                // Se o preço já estiver como string, apenas garantir o formato
                formattedPrice = service.price.includes('R$') ? service.price : `R$ ${service.price}`;
            }
        }
        
        // Criar a visualização em miniatura
        serviceCard.innerHTML = `
            <div class="service-summary">
                <div class="service-info">
                    <div class="service-name">${service.name}</div>
                    <div class="service-mini-details">
                        ${service.category ? `<div class="service-category"><i class="fas fa-tag"></i> ${service.category}</div>` : ''}
                        <div class="service-price"><i class="fas fa-dollar-sign"></i> ${formattedPrice}</div>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="edit-btn" title="Editar serviço"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" title="Excluir serviço"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            
            <div class="service-details">
                ${service.description ? `
                    <div class="detail-item">
                        <div class="detail-label">Descrição</div>
                        <div class="detail-value">${service.description}</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return serviceCard;
    },
    
    // Função para ordenar serviços por nome
    sortServicesByName: function(services) {
        if (!services || !Array.isArray(services)) {
            return [];
        }
        
        return services.sort((a, b) => {
            if (!a.name) return 1;
            if (!b.name) return -1;
            return a.name.localeCompare(b.name, 'pt-BR');
        });
    },
    
    // Editar serviço
    editService: function(serviceId) {
        DB.services.getById(serviceId)
            .then(service => {
                if (service) {
                    document.getElementById('modal-title').textContent = 'Editar Serviço';
                    document.getElementById('service-id').value = service.id;
                    document.getElementById('service-name').value = service.name;
                    
                    // Selecionar categoria
                    if (this.elements.categorySelect) {
                        if (service.category) {
                            // Verificar se a categoria existe no dropdown
                            let categoryExists = false;
                            for (let i = 0; i < this.elements.categorySelect.options.length; i++) {
                                if (this.elements.categorySelect.options[i].value === service.category) {
                                    this.elements.categorySelect.value = service.category;
                                    categoryExists = true;
                                    break;
                                }
                            }
                            
                            // Se a categoria não existir, adicionar
                            if (!categoryExists && service.category) {
                                // Adicionar à lista de categorias
                                CategoriesComponent.categories.push(service.category);
                                CategoriesComponent.saveCategories();
                                
                                // Atualizar dropdown
                                this.updateCategorySelect(CategoriesComponent.getCategories());
                                this.elements.categorySelect.value = service.category;
                            }
                        } else {
                            this.elements.categorySelect.value = '';
                        }
                    }
                    
                    // Preencher preço
                    if (this.elements.priceInput) {
                        if (typeof service.price === 'number') {
                            this.elements.priceInput.value = service.price.toFixed(2).replace('.', ',');
                        } else if (typeof service.price === 'string') {
                            this.elements.priceInput.value = service.price.replace('R$', '').trim();
                        } else {
                            this.elements.priceInput.value = '';
                        }
                    }
                    
                    // Preencher descrição
                    const descriptionInput = document.getElementById('service-description');
                    if (descriptionInput) {
                        descriptionInput.value = service.description || '';
                    }
                    
                    // Mostrar modal
                    if (this.elements.serviceModal) {
                        this.elements.serviceModal.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar serviço para edição:', error);
                alert('Erro ao carregar dados do serviço. Tente novamente.');
            });
    },
    
    // Excluir serviço
    deleteService: function(serviceId) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            DB.services.delete(serviceId)
                .then(() => {
                    this.loadServices();
                })
                .catch(error => {
                    console.error('Erro ao excluir serviço:', error);
                    alert('Erro ao excluir serviço. Tente novamente.');
                });
        }
    },
    
    // Formatar preço para exibição
    formatPrice: function(price) {
        if (!price) return '';
        
        // Verificar se o preço já está formatado como moeda
        if (typeof price === 'string' && price.includes('R$')) {
            return price;
        }
        
        // Converter para número se for string
        let numericPrice = price;
        if (typeof price === 'string') {
            // Remover caracteres não numéricos, exceto vírgula e ponto
            const cleanPrice = price.replace(/[^\d,.]/g, '');
            // Substituir vírgula por ponto para cálculos
            numericPrice = parseFloat(cleanPrice.replace(',', '.'));
        }
        
        if (isNaN(numericPrice)) return price;
        
        // Formatar como moeda brasileira
        return numericPrice.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
};

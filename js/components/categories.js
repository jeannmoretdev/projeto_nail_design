// Componente de Gerenciamento de Categorias
const CategoriesComponent = {
    // Elementos DOM
    elements: {
        categoryModal: null,
        categoryList: null,
        addCategoryBtn: null,
        closeCategoryModalBtn: null
    },
    
    // Armazenar categorias
    categories: [],
    
    // Callback para atualização
    onCategoriesUpdated: null,
    
    // Inicializar componente
    init: function(onCategoriesUpdated) {
        try {
            console.log('Inicializando componente de categorias');
            // Adicionar template do modal ao DOM
            document.body.insertAdjacentHTML('beforeend', categoryTemplate);
            
            // Inicializar elementos DOM
            this.initElements();
            
            // Carregar categorias
            this.loadCategories();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Configurar callback
            this.onCategoriesUpdated = onCategoriesUpdated;
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de categorias:', error);
            return false;
        }
    },
    
    // Inicializar referências aos elementos DOM
    initElements: function() {
        console.log('Inicializando elementos DOM do componente de categorias');
        this.elements = {
            categoryModal: document.getElementById('category-modal'),
            categoryList: document.getElementById('category-management-list'),
            addCategoryBtn: document.getElementById('modal-add-category-btn'),
            closeCategoryModalBtn: document.getElementById('close-category-modal-btn')
        };
        
        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`Elemento '${key}' não encontrado no DOM`);
            } else {
                console.log(`Elemento '${key}' encontrado: `, element);
            }
        }
    },
    
    // Carregar categorias do localStorage
    loadCategories: function() {
        try {
            console.log('Carregando categorias do localStorage');
            // Tentar carregar categorias do localStorage
            const storedCategories = localStorage.getItem('customCategories');
            if (storedCategories) {
                this.categories = JSON.parse(storedCategories);
                console.log('Categorias carregadas:', this.categories);
            } else {
                // Categorias padrão se não houver nenhuma salva
                this.categories = [
                    'Colocação Fibra', 'Colocação Gel', 
                    'Manutenção Fibra', 'Manutenção Gel', 
                    'Blindagem'
                ];
                console.log('Usando categorias padrão:', this.categories);
                this.saveCategories();
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            // Categorias padrão em caso de erro
            this.categories = [
                'Colocação Fibra', 'Colocação Gel', 
                'Manutenção Fibra', 'Manutenção Gel', 
                'Blindagem'
            ];
            this.saveCategories();
        }
    },
    
    // Salvar categorias no localStorage
    saveCategories: function() {
        try {
            console.log('Salvando categorias no localStorage:', this.categories);
            localStorage.setItem('customCategories', JSON.stringify(this.categories));
            
            // Chamar callback se existir
            if (typeof this.onCategoriesUpdated === 'function') {
                console.log('Chamando callback onCategoriesUpdated');
                this.onCategoriesUpdated(this.categories);
            }
        } catch (error) {
            console.error('Erro ao salvar categorias:', error);
        }
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        console.log('Configurando eventos do componente de categorias');
        const self = this;
        
        // Fechar modal
        const closeModalBtn = this.elements.categoryModal.querySelector('.close-modal');
        if (closeModalBtn) {
            console.log('Configurando evento para fechar modal (X)');
            closeModalBtn.addEventListener('click', () => {
                this.elements.categoryModal.style.display = 'none';
            });
        }
        
        // Fechar modal com botão Fechar
        if (this.elements.closeCategoryModalBtn) {
            console.log('Configurando evento para botão Fechar');
            this.elements.closeCategoryModalBtn.addEventListener('click', () => {
                this.elements.categoryModal.style.display = 'none';
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.categoryModal) {
                this.elements.categoryModal.style.display = 'none';
            }
        });
        
        // Adicionar categoria
        if (this.elements.addCategoryBtn) {
            console.log('Configurando evento para botão Adicionar Categoria (modal)');
            console.log('Botão encontrado:', this.elements.addCategoryBtn);
            
            // Adicionar evento diretamente
            this.elements.addCategoryBtn.onclick = (e) => {
                console.log('Botão Adicionar Categoria (modal) clicado!', e);
                e.preventDefault();
                this.addCategory();
                return false;
            };
        } else {
            console.error('Botão de adicionar categoria (modal) não encontrado');
        }
    },
    
    // Mostrar modal de gerenciamento de categorias
    show: function() {
        console.log('Mostrando modal de gerenciamento de categorias');
        if (!this.elements.categoryModal) {
            console.error('Modal de categorias não encontrado');
            return;
        }
        
        // Atualizar lista de categorias
        this.updateCategoryList();
        
        // Mostrar modal
        this.elements.categoryModal.style.display = 'block';
        
        // Verificar se o botão de adicionar categoria está funcionando
        console.log('Verificando botão de adicionar categoria no modal');
        
        // Tentar encontrar o botão novamente (pode ter sido recriado pelo template)
        const modalAddCategoryBtn = document.getElementById('modal-add-category-btn');
        console.log('Botão encontrado no DOM atual:', modalAddCategoryBtn);
        
        if (modalAddCategoryBtn) {
            console.log('Reconfigurando evento para o botão');
            
            // Remover eventos anteriores
            modalAddCategoryBtn.onclick = null;
            
            // Adicionar evento diretamente
            const self = this;
            modalAddCategoryBtn.onclick = function(e) {
                console.log('Botão Adicionar Categoria (modal) clicado!', e);
                e.preventDefault();
                self.addCategory();
                return false;
            };
            
            console.log('Evento configurado para o botão:', modalAddCategoryBtn);
        } else {
            console.error('Botão de adicionar categoria (modal) não encontrado no DOM atual');
        }
    },
    
    // Atualizar lista de categorias no modal
    updateCategoryList: function() {
        console.log('Atualizando lista de categorias no modal');
        if (!this.elements.categoryList) {
            console.error('Lista de categorias não encontrada');
            return;
        }
        
        // Limpar lista
        this.elements.categoryList.innerHTML = '';
        
        // Verificar se há categorias
        if (!Array.isArray(this.categories) || this.categories.length === 0) {
            console.log('Nenhuma categoria encontrada');
            this.elements.categoryList.innerHTML = '<li class="empty-category-message">Nenhuma categoria encontrada</li>';
            return;
        }
        
        console.log('Renderizando categorias:', this.categories);
        
        // Adicionar categorias à lista
        this.categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.className = 'category-item';
            listItem.dataset.category = category;
            
            listItem.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-actions">
                    <button class="category-edit-btn" title="Editar categoria">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="category-delete-btn" title="Excluir categoria">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.elements.categoryList.appendChild(listItem);
            
            // Adicionar eventos
            const editBtn = listItem.querySelector('.category-edit-btn');
            const deleteBtn = listItem.querySelector('.category-delete-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.editCategory(category);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteCategory(category);
                });
            }
        });
    },
    
    // Adicionar categoria (usando prompt)
    addCategory: function() {
        console.log('Método addCategory chamado!');
        const newCategory = prompt('Digite o nome da nova categoria:');
        console.log('Nova categoria digitada:', newCategory);
        
        if (newCategory && newCategory.trim()) {
            // Verificar se a categoria já existe
            if (this.categories.includes(newCategory.trim())) {
                console.log('Categoria já existe:', newCategory.trim());
                alert('Esta categoria já existe.');
                return;
            }
            
            // Adicionar categoria
            console.log('Adicionando nova categoria:', newCategory.trim());
            this.categories.push(newCategory.trim());
            
            // Salvar e atualizar
            this.saveCategories();
            this.updateCategoryList();
            console.log('Categoria adicionada com sucesso!');
        } else {
            console.log('Adição de categoria cancelada ou nome vazio');
        }
    },
    
    // Editar categoria
    editCategory: function(oldCategory) {
        console.log('Editando categoria:', oldCategory);
        const newCategory = prompt('Digite o novo nome para a categoria:', oldCategory);
        
        if (newCategory && newCategory.trim() && newCategory.trim() !== oldCategory) {
            // Verificar se a nova categoria já existe
            if (this.categories.includes(newCategory.trim())) {
                console.log('Nova categoria já existe:', newCategory.trim());
                alert('Esta categoria já existe. Por favor, escolha outro nome.');
                return;
            }
            
            // Atualizar categoria
            const index = this.categories.indexOf(oldCategory);
            if (index !== -1) {
                console.log(`Atualizando categoria de "${oldCategory}" para "${newCategory.trim()}"`);
                this.categories[index] = newCategory.trim();
                
                // Salvar e atualizar
                this.saveCategories();
                this.updateCategoryList();
                
                // Atualizar serviços com a categoria antiga
                this.updateServicesCategory(oldCategory, newCategory.trim());
            }
        } else {
            console.log('Edição de categoria cancelada ou sem alterações');
        }
    },
    
    // Atualizar categoria nos serviços
    updateServicesCategory: function(oldCategory, newCategory) {
        console.log(`Atualizando serviços da categoria "${oldCategory}" para "${newCategory}"`);
        DB.services.getAll()
            .then(services => {
                const servicesWithCategory = services.filter(service => service.category === oldCategory);
                console.log(`Encontrados ${servicesWithCategory.length} serviços com a categoria "${oldCategory}"`);
                
                if (servicesWithCategory.length === 0) {
                    return Promise.resolve();
                }
                
                const updatePromises = servicesWithCategory.map(service => {
                    service.category = newCategory;
                    return DB.services.update(service);
                });
                
                return Promise.all(updatePromises);
            })
            .then(() => {
                console.log('Serviços atualizados com sucesso');
            })
            .catch(error => {
                console.error('Erro ao atualizar serviços:', error);
                alert('Erro ao atualizar categoria nos serviços. Tente novamente.');
            });
    },
    
    // Excluir categoria
    deleteCategory: function(category) {
        console.log('Excluindo categoria:', category);
        if (!category) {
            console.error('Nome de categoria inválido');
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
            console.log('Exclusão cancelada pelo usuário');
            return;
        }
        
        // Verificar se existem serviços usando esta categoria
        DB.services.getAll()
            .then(services => {
                const servicesWithCategory = services.filter(service => service.category === category);
                console.log(`Encontrados ${servicesWithCategory.length} serviços com a categoria "${category}"`);
                
                if (servicesWithCategory.length > 0) {
                    const confirmMessage = `Existem ${servicesWithCategory.length} serviço(s) usando esta categoria. Se você excluir a categoria, esses serviços ficarão sem categoria. Deseja continuar?`;
                    
                    if (!confirm(confirmMessage)) {
                        console.log('Exclusão cancelada pelo usuário após aviso de serviços');
                        return Promise.reject('Operação cancelada pelo usuário');
                    }
                    
                    // Atualizar serviços para remover a categoria
                    console.log('Removendo categoria dos serviços associados');
                    const updatePromises = servicesWithCategory.map(service => {
                        service.category = '';
                        return DB.services.update(service);
                    });
                    
                    return Promise.all(updatePromises);
                }
                return Promise.resolve();
            })
            .then(() => {
                // Remover categoria
                const index = this.categories.indexOf(category);
                if (index !== -1) {
                    console.log(`Removendo categoria "${category}" da lista`);
                    this.categories.splice(index, 1);
                    
                    // Salvar e atualizar
                    this.saveCategories();
                    this.updateCategoryList();
                    console.log('Categoria excluída com sucesso');
                }
            })
            .catch(error => {
                if (error !== 'Operação cancelada pelo usuário') {
                    console.error('Erro ao excluir categoria:', error);
                    alert('Erro ao excluir categoria. Tente novamente.');
                }
            });
    },
    
    // Obter todas as categorias
    getCategories: function() {
        return [...this.categories];
    },
    
    // Adicionar botão de gerenciamento de categorias
    addManagementButton: function(container) {
        console.log('Adicionando botão de gerenciamento de categorias');
        if (!container) {
            console.error('Container para botão de gerenciamento não especificado');
            return;
        }
        
        console.log('Container para botão:', container);
        
        // Criar o botão
        const manageCategoriesBtn = document.createElement('button');
        manageCategoriesBtn.id = 'manage-categories-btn';
        manageCategoriesBtn.className = 'action-btn secondary';
        manageCategoriesBtn.innerHTML = '<i class="fas fa-tags"></i> Gerenciar Categorias';
        
        // Adicionar ao container
        container.appendChild(manageCategoriesBtn);
        console.log('Botão de gerenciamento adicionado:', manageCategoriesBtn);
        
        // Adicionar evento de clique
        manageCategoriesBtn.addEventListener('click', () => {
            console.log('Botão de gerenciamento clicado');
            this.show();
        });
    }
};
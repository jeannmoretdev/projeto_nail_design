// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Instancia o banco de dados
    const db = new Database();
    await db.init();
    
    // Elementos do DOM
    const elements = {
        form: document.getElementById('clientForm'),
        clientList: document.getElementById('clientList'),
        emptyState: document.getElementById('emptyState'),
        searchInput: document.getElementById('searchInput'),
        modal: document.getElementById('clientModal'),
        clientDetails: document.getElementById('clientDetails'),
        closeModal: document.getElementById('closeModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        editClientBtn: document.getElementById('editClientBtn'),
        saveButton: document.getElementById('saveButton'),
        cancelButton: document.getElementById('cancelButton'),
        clientId: document.getElementById('clientId'),
        name: document.getElementById('name'),
        phone: document.getElementById('phone'),
        location: document.getElementById('location'),
        services: document.getElementById('services'),
        date: document.getElementById('date')
    };
    
    // Estado da aplicação
    const state = {
        isEditing: false,
        currentClientId: null
    };
    
    // Carrega a lista de clientes
    await loadClients();
    
    // Event listeners
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.searchInput.addEventListener('input', handleSearch);
    elements.closeModal.addEventListener('click', closeModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.editClientBtn.addEventListener('click', handleEditClick);
    elements.cancelButton.addEventListener('click', resetForm);
    
    // Funções de manipulação de eventos
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const client = {
            name: elements.name.value.trim(),
            phone: elements.phone.value.trim(),
            location: elements.location.value.trim(),
            services: elements.services.value.trim(),
            date: elements.date.value
        };
        
        try {
            if (state.isEditing) {
                client.id = parseInt(elements.clientId.value);
                await db.updateClient(client);
                showNotification(CONFIG.messages.updateSuccess);
            } else {
                await db.addClient(client);
                showNotification(CONFIG.messages.saveSuccess);
            }
            
            resetForm();
            await loadClients();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            showNotification(CONFIG.messages.error, 'error');
        }
    }
    
    async function handleSearch() {
        const query = elements.searchInput.value.trim();
        await loadClients(query);
    }
    
    function handleEditClick() {
        if (state.currentClientId) {
            editClient(state.currentClientId);
            closeModal();
        }
    }
    
    // Funções auxiliares
    async function loadClients(query = '') {
        try {
            const clients = await db.searchClients(query);
            renderClientList(clients);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            showNotification(CONFIG.messages.error, 'error');
        }
    }
    
    function renderClientList(clients) {
        elements.clientList.innerHTML = '';
        
        if (clients.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }
        
        elements.emptyState.classList.add('hidden');
        
        // Ordena os clientes por data (mais recentes primeiro)
        clients.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        clients.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // Formata a data para exibição
            const formattedDate = new Date(client.date).toLocaleDateString('pt-BR', CONFIG.ui.dateFormat);
            
            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${client.name}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${client.phone}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${formattedDate}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-secondary hover:text-secondary-dark mr-3 view-btn" data-id="${client.id}">
                        Ver
                    </button>
                    <button class="text-blue-500 hover:text-blue-700 mr-3 edit-btn" data-id="${client.id}">
                        Editar
                    </button>
                    <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${client.id}">
                        Excluir
                    </button>
                </td>
            `;
            
            // Adiciona event listeners para os botões
            row.querySelector('.view-btn').addEventListener('click', () => viewClient(client.id));
            row.querySelector('.edit-btn').addEventListener('click', () => editClient(client.id));
            row.querySelector('.delete-btn').addEventListener('click', () => deleteClient(client.id));
            
            elements.clientList.appendChild(row);
        });
    }
    
    async function viewClient(id) {
        try {
            const client = await db.getClient(id);
            state.currentClientId = id;
            
            if (client) {
                const formattedDate = new Date(client.date).toLocaleDateString('pt-BR', CONFIG.ui.dateFormat);
                
                elements.clientDetails.innerHTML = `
                    <div class="mb-3">
                        <span class="font-semibold">Nome:</span>
                        <p>${client.name}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold">Telefone:</span>
                        <p>${client.phone}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold">Local:</span>
                        <p>${client.location || 'Não informado'}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold">Serviços Realizados:</span>
                        <p>${client.services}</p>
                    </div>
                    <div>
                        <span class="font-semibold">Data:</span>
                        <p>${formattedDate}</p>
                    </div>
                `;
                
                openModal();
            }
        } catch (error) {
            console.error('Erro ao visualizar cliente:', error);
            showNotification(CONFIG.messages.error, 'error');
        }
    }
    
    async function editClient(id) {
        try {
            const client = await db.getClient(id);
            
            if (client) {
                elements.clientId.value = client.id;
                elements.name.value = client.name;
                elements.phone.value = client.phone;
                elements.location.value = client.location || '';
                elements.services.value = client.services;
                elements.date.value = client.date;
                
                state.isEditing = true;
                elements.saveButton.textContent = 'Atualizar';
                elements.cancelButton.classList.remove('hidden');
                
                // Scroll para o formulário
                elements.form.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Erro ao editar cliente:', error);
            showNotification(CONFIG.messages.error, 'error');
        }
    }
    
    async function deleteClient(id) {
        if (confirm(CONFIG.messages.deleteConfirm)) {
            try {
                await db.deleteClient(id);
                await loadClients();
                showNotification(CONFIG.messages.deleteSuccess);
                
                // Se estiver editando o cliente que foi excluído, reseta o formulário
                if (state.isEditing && state.currentClientId === id) {
                    resetForm();
                }
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                showNotification(CONFIG.messages.error, 'error');
            }
        }
    }
    
    function resetForm() {
        elements.form.reset();
        elements.clientId.value = '';
        state.isEditing = false;
        state.currentClientId = null;
        elements.saveButton.textContent = 'Salvar';
        elements.cancelButton.classList.add('hidden');
    }
    
    function openModal() {
        elements.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Previne rolagem
    }
    
    function closeModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    function showNotification(message, type = 'success') {
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fadeIn z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove a notificação após 3 segundos
        setTimeout(() => {
            notification.classList.add('opacity-0');
            notification.style.transition = 'opacity 0.5s ease-in-out';
            
            // Remove o elemento do DOM após a transição
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Inicialização específica para iOS
    function initIOSSpecifics() {
        // Corrige problemas de input no iOS
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => {
                // Pequeno delay para garantir que o teclado virtual seja fechado
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            });
        });
        
        // Detecta se é iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            // Ajustes específicos para iOS
            document.documentElement.classList.add('ios');
            
            // Corrige problema de 100vh no iOS
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            window.addEventListener('resize', () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            });
        }
    }
    
    // Inicializa ajustes específicos para iOS
    initIOSSpecifics();
});
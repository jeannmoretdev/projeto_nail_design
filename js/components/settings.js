// Componente de Configurações
const SettingsComponent = {
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template
            // Alterando de 'content' para 'settings' que é o ID correto da seção
            await SettingsTemplate.loadTemplate('settings', 'settings');
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Aplicar configurações salvas
            this.applyStoredSettings();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componente de configurações:', error);
            return false;
        }
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        // Tema
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', () => {
                this.changeTheme(themeSelector.value);
            });
            
            // Definir valor inicial
            const currentTheme = localStorage.getItem('theme') || 'light';
            themeSelector.value = currentTheme;
        }
        
        // Tamanho da fonte
        const fontSizeSelector = document.getElementById('font-size');
        if (fontSizeSelector) {
            fontSizeSelector.addEventListener('change', () => {
                this.changeFontSize(fontSizeSelector.value);
            });
            
            // Definir valor inicial
            const currentFontSize = localStorage.getItem('fontSize') || 'medium';
            fontSizeSelector.value = currentFontSize;
        }
        
        // Exportar dados
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Importar dados
        const importFileInput = document.getElementById('import-file');
        if (importFileInput) {
            importFileInput.addEventListener('change', (event) => {
                this.importData(event.target.files[0]);
            });
        }
        
        // Limpar dados
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
    },
    
    // Aplicar configurações salvas
    applyStoredSettings: function() {
        // Aplicar tema
        const theme = localStorage.getItem('theme') || 'light';
        this.changeTheme(theme);
        
        // Aplicar tamanho da fonte
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        this.changeFontSize(fontSize);
    },
    
    // Mudar tema
    changeTheme: function(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
    },
    
    // Mudar tamanho da fonte
    changeFontSize: function(size) {
        const rootElement = document.documentElement;
        
        switch (size) {
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
        
        localStorage.setItem('fontSize', size);
    },
    
    // Exportar dados
    exportData: async function() {
        try {
            // Obter todos os dados
            const [clients, services] = await Promise.all([
                DB.clients.getAll(),
                DB.services.getAll()
            ]);
            
            // Criar objeto de exportação
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    clients: clients,
                    services: services
                }
            };
            
            // Converter para JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Criar blob e link para download
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `nail_design_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Mostrar mensagem de sucesso
            this.showStatusMessage('success', 'Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showStatusMessage('error', 'Erro ao exportar dados. Tente novamente.');
        }
    },
    
    // Importar dados
    importData: function(file) {
        if (!file) {
            this.showStatusMessage('error', 'Nenhum arquivo selecionado.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                
                // Validar estrutura do arquivo
                if (!importData.data || (!importData.data.clients && !importData.data.services)) {
                    throw new Error('Formato de arquivo inválido.');
                }
                
                // Verificar se já existem dados e pedir confirmação
                const [existingClients, existingServices] = await Promise.all([
                    DB.clients.getAll(),
                    DB.services.getAll()
                ]);
                
                let hasExistingData = false;
                let confirmMessage = 'Esta ação irá substituir ';
                
                if (existingClients.length > 0 && importData.data.clients) {
                    hasExistingData = true;
                    confirmMessage += `${existingClients.length} cliente(s) existente(s)`;
                }
                
                if (existingServices.length > 0 && importData.data.services) {
                    hasExistingData = true;
                    if (existingClients.length > 0) {
                        confirmMessage += ` e ${existingServices.length} serviço(s) existente(s)`;
                    } else {
                        confirmMessage += `${existingServices.length} serviço(s) existente(s)`;
                    }
                }
                
                confirmMessage += '. Esta ação não pode ser desfeita. Deseja continuar?';
                
                // Se já existem dados, pedir confirmação
                if (hasExistingData) {
                    if (!confirm(confirmMessage)) {
                        this.showStatusMessage('info', 'Importação cancelada pelo usuário.');
                        return;
                    }
                }
                
                // Importar clientes
                if (importData.data.clients && importData.data.clients.length > 0) {
                    try {
                        // Limpar clientes existentes
                        if (typeof DB.clients.clear === 'function') {
                            await DB.clients.clear();
                        } else {
                            // Alternativa: obter todos os clientes e excluí-los um por um
                            const existingClients = await DB.clients.getAll();
                            for (const client of existingClients) {
                                await DB.clients.delete(client.id);
                            }
                        }
                        
                        // Adicionar novos clientes
                        const clientPromises = importData.data.clients.map(client => {
                            // Remover ID para evitar conflitos
                            const { id, ...clientData } = client;
                            return DB.clients.add(clientData);
                        });
                        
                        await Promise.all(clientPromises);
                        console.log(`${importData.data.clients.length} clientes importados com sucesso.`);
                    } catch (error) {
                        console.error('Erro ao importar clientes:', error);
                        throw new Error(`Erro ao importar clientes: ${error.message}`);
                    }
                }
                
                // Importar serviços
                if (importData.data.services && importData.data.services.length > 0) {
                    try {
                        // Verificar se a função clear existe
                        if (typeof DB.services.clear === 'function') {
                            // Limpar serviços existentes
                            await DB.services.clear();
                        } else {
                            // Alternativa: obter todos os serviços e excluí-los um por um
                            const existingServices = await DB.services.getAll();
                            for (const service of existingServices) {
                                await DB.services.delete(service.id);
                            }
                        }
                        
                        // Adicionar novos serviços
                        const servicePromises = importData.data.services.map(service => {
                            // Remover ID para evitar conflitos
                            const { id, ...serviceData } = service;
                            return DB.services.add(serviceData);
                        });
                        
                        await Promise.all(servicePromises);
                        console.log(`${importData.data.services.length} serviços importados com sucesso.`);
                        
                        // Extrair categorias personalizadas
                        const categories = [...new Set(importData.data.services.map(service => service.category))];
                        
                        // Salvar categorias no localStorage
                        try {
                            localStorage.setItem('customCategories', JSON.stringify(categories));
                        } catch (error) {
                            console.error('Erro ao salvar categorias personalizadas:', error);
                        }
                    } catch (error) {
                        console.error('Erro ao importar serviços:', error);
                        throw new Error(`Erro ao importar serviços: ${error.message}`);
                    }
                }
                
                // Recarregar componentes
                if (typeof ClientsComponent !== 'undefined' && ClientsComponent.loadClients) {
                    ClientsComponent.loadClients();
                }
                
                if (typeof ServicesComponent !== 'undefined' && ServicesComponent.loadServices) {
                    ServicesComponent.loadServices();
                }
                
                this.showStatusMessage('success', 'Dados importados com sucesso!');
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                this.showStatusMessage('error', `Erro ao importar dados: ${error.message}`);
            }
        };
        
        reader.onerror = () => {
            this.showStatusMessage('error', 'Erro ao ler o arquivo.');
        };
        
        reader.readAsText(file);
    },
    
    // Limpar todos os dados
    clearAllData: function() {
        if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os seus dados e não pode ser desfeita. Deseja continuar?')) {
            Promise.all([
                DB.clients.clear(),
                DB.services.clear()
            ])
                .then(() => {
                    // Recarregar componentes
                    if (typeof ClientsComponent !== 'undefined' && ClientsComponent.loadClients) {
                        ClientsComponent.loadClients();
                    }
                    
                    if (typeof ServicesComponent !== 'undefined' && ServicesComponent.loadServices) {
                        ServicesComponent.loadServices();
                    }
                    
                    // Limpar categorias personalizadas
                    localStorage.removeItem('customCategories');
                    
                    this.showStatusMessage('success', 'Todos os dados foram apagados com sucesso.');
                })
                .catch(error => {
                    console.error('Erro ao limpar dados:', error);
                    this.showStatusMessage('error', 'Erro ao limpar dados. Tente novamente.');
                });
        }
    },
    
    // Mostrar mensagem de status
    showStatusMessage: function(type, message) {
        const statusElement = document.getElementById('import-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            
            // Esconder mensagem após 5 segundos
            setTimeout(() => {
                statusElement.className = 'status-message';
            }, 5000);
        }
    }
};
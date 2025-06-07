// Componente de Configurações
const SettingsComponent = {
    // Elementos DOM
    elements: {
        themeSelector: null,
        fontSizeSelector: null,
        exportDataBtn: null,
        importFileInput: null,
        importStatus: null,
        clearDataBtn: null
    },
    
    // Inicializar componente
    init: async function() {
        try {
            // Carregar o template
            await SettingsTemplate.loadTemplate('settings', 'settings');
            
            // Inicializar elementos DOM após carregar o template
            this.initElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Carregar configurações salvas
            this.loadSavedSettings();
            
            return true;
        } catch (error) {
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
            return false;
        }
    },
    
    // Inicializar referências aos elementos DOM
    initElements: function() {
        this.elements = {
            themeSelector: document.getElementById('theme-selector'),
            fontSizeSelector: document.getElementById('font-size'),
            exportDataBtn: document.getElementById('export-data'),
            importFileInput: document.getElementById('import-file'),
            importStatus: document.getElementById('import-status'),
            clearDataBtn: document.getElementById('clear-data')
        };
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        // Mudar tema
        if (this.elements.themeSelector) {
            this.elements.themeSelector.addEventListener('change', () => {
                const theme = this.elements.themeSelector.value;
                this.setTheme(theme);
                this.saveSettings();
            });
        }
        
        // Mudar tamanho da fonte
        if (this.elements.fontSizeSelector) {
            this.elements.fontSizeSelector.addEventListener('change', () => {
                const fontSize = this.elements.fontSizeSelector.value;
                this.setFontSize(fontSize);
                this.saveSettings();
            });
        }
        
        // Exportar dados
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Importar dados
        if (this.elements.importFileInput) {
            this.elements.importFileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.importData(file);
                }
            });
        }
        
        // Limpar dados
        if (this.elements.clearDataBtn) {
            this.elements.clearDataBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
    },
    
    // Carregar configurações salvas
    loadSavedSettings: function() {
        const settings = localStorage.getItem('appSettings');
        
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                
                // Aplicar tema
                if (parsedSettings.theme && this.elements.themeSelector) {
                    this.elements.themeSelector.value = parsedSettings.theme;
                    this.setTheme(parsedSettings.theme);
                }
                
                // Aplicar tamanho da fonte
                if (parsedSettings.fontSize && this.elements.fontSizeSelector) {
                    this.elements.fontSizeSelector.value = parsedSettings.fontSize;
                    this.setFontSize(parsedSettings.fontSize);
                }
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
            }
        }
    },
    
    // Salvar configurações
    saveSettings: function() {
        try {
            const settings = {
                theme: this.elements.themeSelector ? this.elements.themeSelector.value : 'light',
                fontSize: this.elements.fontSizeSelector ? this.elements.fontSizeSelector.value : 'medium'
            };
            
            localStorage.setItem('appSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    },
    
    // Definir tema
    setTheme: function(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
    },
    
    // Definir tamanho da fonte
    setFontSize: function(size) {
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
            default:
                rootElement.style.setProperty('--base-font-size', '16px');
        }
    },
    
    // Exportar dados
    exportData: async function() {
        try {
            // Obter todos os dados do banco de dados
            const clients = await DB.clients.getAll();
            
            // Criar objeto com todos os dados
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    clients: clients
                }
            };
            
            // Converter para JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Criar blob e link para download
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Criar elemento de link para download
            const a = document.createElement('a');
            a.href = url;
            a.download = `nail_designer_backup_${this.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            // Mostrar mensagem de sucesso
            this.showStatus('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showStatus('Erro ao exportar dados: ' + error.message, 'error');
        }
    },
    
    // Importar dados
    importData: function(file) {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                
                // Verificar se o arquivo tem o formato esperado
                if (!jsonData.version || !jsonData.data) {
                    throw new Error('Formato de arquivo inválido');
                }
                
                // Criar um modal de confirmação personalizado
                const confirmDialog = document.createElement('div');
                confirmDialog.className = 'import-confirm-dialog';
                confirmDialog.innerHTML = `
                    <div class="import-dialog-content">
                        <h3>Importar Dados</h3>
                        <p>Como você deseja importar os dados?</p>
                        
                        <div class="import-options">
                            <button id="btn-add" class="btn btn-primary">
                                <i class="fas fa-plus-circle"></i> ADICIONAR aos dados existentes
                            </button>
                            
                            <button id="btn-replace" class="import-btn-danger">
                                <i class="fas fa-exclamation-triangle"></i> SUBSTITUIR TUDO (apaga dados existentes)
                            </button>
                            
                            <button id="btn-cancel" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancelar importação
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(confirmDialog);
                
                // Processar a escolha do usuário
                return new Promise((resolve) => {
                    document.getElementById('btn-add').addEventListener('click', async () => {
                        // Adicionar aos dados existentes
                        await this.processImport(jsonData, false);
                        confirmDialog.remove();
                        resolve();
                    });
                    
                    document.getElementById('btn-replace').addEventListener('click', async () => {
                        // Substituir todos os dados
                        if (confirm('ATENÇÃO: Todos os dados existentes serão apagados. Esta ação não pode ser desfeita. Deseja continuar?')) {
                            await this.processImport(jsonData, true);
                            confirmDialog.remove();
                            resolve();
                        }
                    });
                    
                    document.getElementById('btn-cancel').addEventListener('click', () => {
                        confirmDialog.remove();
                        this.elements.importFileInput.value = '';
                        resolve();
                    });
                });
                
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                this.showStatus('Erro ao importar dados: ' + error.message, 'error');
                if (this.elements.importFileInput) {
                    this.elements.importFileInput.value = '';
                }
            }
        };
        
        reader.onerror = () => {
            this.showStatus('Erro ao ler o arquivo', 'error');
            if (this.elements.importFileInput) {
                this.elements.importFileInput.value = '';
            }
        };
        
        reader.readAsText(file);
    },
    
    // Limpar todos os dados
    clearAllData: async function() {
        if (confirm('ATENÇÃO: Esta ação excluirá TODOS os seus dados e não pode ser desfeita. Deseja continuar?')) {
            if (confirm('Tem certeza? Todos os clientes e configurações serão perdidos.')) {
                try {
                    await this.clearDatabase();
                    localStorage.clear();
                    
                    this.showStatus('Todos os dados foram excluídos. Recarregando a página...', 'success');
                    
                    // Recarregar a página após 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    console.error('Erro ao limpar dados:', error);
                    this.showStatus('Erro ao limpar dados: ' + error.message, 'error');
                }
            }
        }
    },
    
    // Limpar banco de dados
    clearDatabase: async function() {
        return new Promise((resolve, reject) => {
            try {
                const transaction = DB.db.transaction(['clients'], 'readwrite');
                const clientsStore = transaction.objectStore('clients');
                
                const clearRequest = clientsStore.clear();
                
                clearRequest.onsuccess = () => {
                    console.log('Banco de dados limpo com sucesso');
                    resolve();
                };
                
                clearRequest.onerror = (event) => {
                    reject(new Error('Erro ao limpar banco de dados: ' + event.target.error));
                };
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Mostrar mensagem de status
    showStatus: function(message, type) {
        if (this.elements.importStatus) {
            this.elements.importStatus.textContent = message;
            this.elements.importStatus.className = 'status-message ' + type;
            
            // Limpar mensagem após 5 segundos
            setTimeout(() => {
                this.elements.importStatus.className = 'status-message';
                this.elements.importStatus.textContent = '';
            }, 5000);
        }
    },
    
    // Formatar data para nome de arquivo
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}${month}${day}_${hours}${minutes}`;
    },
    
    // Adicione esta nova função para processar a importação
    processImport: async function(jsonData, replaceAll) {
        try {
            // Se for para substituir, limpar o banco de dados primeiro
            if (replaceAll) {
                await this.clearDatabase();
            }
            
            // Importar clientes
            if (jsonData.data.clients && Array.isArray(jsonData.data.clients)) {
                const clientPromises = jsonData.data.clients.map(client => {
                    // Remover ID para evitar conflitos
                    const { id, ...clientData } = client;
                    return DB.clients.add(clientData);
                });
                
                await Promise.all(clientPromises);
            }
            
            // Mostrar mensagem de sucesso
            this.showStatus('Dados importados com sucesso! Recarregando a página...', 'success');
            
            // Recarregar a página após 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Erro ao processar importação:', error);
            this.showStatus('Erro ao processar importação: ' + error.message, 'error');
        }
    }
};
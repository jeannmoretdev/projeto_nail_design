// Template para a página de configurações
const SettingsTemplate = {
    // Carregar template
    loadTemplate: function(containerId, templateId) {
        return new Promise((resolve, reject) => {
            try {
                const container = document.getElementById(containerId);
                
                if (!container) {
                    reject(new Error(`Container #${containerId} não encontrado`));
                    return;
                }
                
                container.innerHTML = this.getTemplate(templateId);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Obter template por ID
    getTemplate: function(templateId) {
        switch (templateId) {
            case 'settings':
                return this.settingsTemplate();
            default:
                throw new Error(`Template "${templateId}" não encontrado`);
        }
    },
    
    // Template da página de configurações
    settingsTemplate: function() {
        return `
            <div class="page-header">
                <h2>Configurações</h2>
                <p>Personalize o aplicativo de acordo com suas preferências</p>
            </div>
            
            <div class="settings-container">
                <div class="settings-section">
                    <h3>Aparência</h3>
                    <p class="settings-description">Personalize a aparência do aplicativo</p>
                    
                    <div class="setting-item">
                        <label for="theme-selector">Tema</label>
                        <select id="theme-selector">
                            <option value="light">Claro</option>
                            <option value="dark">Escuro</option>
                            <option value="pink">Rosa</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label for="font-size">Tamanho da Fonte</label>
                        <select id="font-size">
                            <option value="small">Pequeno</option>
                            <option value="medium" selected>Médio</option>
                            <option value="large">Grande</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Backup e Restauração</h3>
                    <p class="settings-description">Exporte seus dados para backup ou importe de um arquivo</p>
                    
                    <div class="settings-actions">
                        <button id="export-data" class="btn btn-primary">
                            <i class="fas fa-download"></i> Exportar Dados
                        </button>
                        
                        <div class="import-container">
                            <label for="import-file" class="btn btn-secondary">
                                <i class="fas fa-upload"></i> Importar Dados
                            </label>
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                        </div>
                    </div>
                    
                    <div id="import-status" class="status-message"></div>
                </div>
                
                <div class="settings-section">
                    <h3>Gerenciamento de Dados</h3>
                    <p class="settings-description">Opções para gerenciar seus dados</p>
                    
                    <div class="danger-zone">
                        <h4>Zona de Perigo</h4>
                        <p>As ações abaixo não podem ser desfeitas. Tenha cuidado!</p>
                        
                        <button id="clear-data" class="danger-btn">
                            <i class="fas fa-trash"></i> Limpar Todos os Dados
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
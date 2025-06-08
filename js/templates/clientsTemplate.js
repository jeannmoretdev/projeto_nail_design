// Carregador de templates
const TemplateLoader = {
    // Templates embutidos para evitar problemas de CORS quando executado localmente
    templates: {
        clients: `
            <div class="section-header">
                <h2>Clientes</h2>
                <button id="add-client-btn" class="action-btn">+ Novo Cliente</button>
            </div>

            <div class="search-bar">
                <input type="text" id="client-search" placeholder="Buscar cliente...">
            </div>

            <div id="clients-list" class="list-container">
                <!-- Clientes serão inseridos aqui via JavaScript -->
            </div>

            <!-- Modal para adicionar/editar cliente -->
            <div id="client-modal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2 id="modal-title">Novo Cliente</h2>
                    
                    <form id="client-form">
                        <input type="hidden" id="client-id">
                        
                        <div class="form-group">
                            <label for="client-name">Nome</label>
                            <input type="text" id="client-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="client-phone">Telefone</label>
                            <input type="tel" id="client-phone" required inputmode="tel">
                        </div>
                        
                        <div class="form-group">
                            <label for="client-birthday">Data de Aniversário</label>
                            <input type="text" id="client-birthday" placeholder="DD/MM" maxlength="5" inputmode="numeric">
                            <small class="form-hint">Formato: DD/MM</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="client-location">Local</label>
                            <input type="text" id="client-location">
                        </div>
                        
                        <div class="form-group">
                            <label for="client-services">Serviços</label>
                            <textarea id="client-services"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="client-notes">Observações</label>
                            <textarea id="client-notes"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-save">Salvar</button>
                            <button type="button" class="btn-cancel">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `
    },
    
    // Carrega um template HTML
    loadTemplate: function(templateName, targetElementId) {
        return new Promise((resolve, reject) => {
            try {
                // Usar o template embutido em vez de buscar via fetch
                const html = this.templates[templateName];
                
                if (!html) {
                    throw new Error(`Template '${templateName}' não encontrado`);
                }
                
                const targetElement = document.getElementById(targetElementId);
                if (!targetElement) {
                    throw new Error(`Elemento alvo '${targetElementId}' não encontrado`);
                }
                
                targetElement.innerHTML = html;
                resolve(true);
            } catch (error) {
                console.error('Erro ao carregar template:', error);
                reject(error);
            }
        });
    }
};
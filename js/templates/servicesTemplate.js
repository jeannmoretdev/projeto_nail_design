// Template para a página de serviços
const servicesTemplate = `
<div class="page-header">
    <h2>Serviços</h2>
    <button id="add-service-btn" class="action-btn">
        <i class="fas fa-plus"></i> Novo Serviço
    </button>
</div>

<div class="search-bar">
    <input type="text" id="service-search" placeholder="Buscar serviços...">
</div>

<div class="list-container">
    <div id="services-list" class="services-list">
        <!-- Lista de serviços será carregada dinamicamente -->
    </div>
</div>

<!-- Modal para adicionar/editar serviço -->
<div id="service-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3 id="modal-title">Novo Serviço</h3>
        <form id="service-form">
            <input type="hidden" id="service-id">
            
            <div class="form-group">
                <label for="service-name">Nome do Serviço</label>
                <input type="text" id="service-name" name="service-name" required>
            </div>
            
            <div class="form-group">
                <label for="service-category">Categoria</label>
                <div class="category-select-container">
                    <select id="service-category" class="category-select">
                        <option value="">Selecione uma categoria</option>
                        <!-- Categorias serão carregadas dinamicamente -->
                    </select>
                    <i class="fas fa-chevron-down category-select-arrow"></i>
                </div>
            </div>
            
            <div class="form-group">
                <label for="service-price">Preço (R$)</label>
                <input type="text" id="service-price" name="service-price" inputmode="decimal">
            </div>
            
            <div class="form-group">
                <label for="service-description">Descrição</label>
                <textarea id="service-description" name="service-description"></textarea>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-save">Salvar</button>
                <button type="button" class="btn-cancel">Cancelar</button>
            </div>
        </form>
    </div>
</div>
`;
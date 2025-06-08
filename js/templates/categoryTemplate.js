// Template para o modal de gerenciamento de categorias
const categoryTemplate = `
<div id="category-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Gerenciar Categorias</h3>
        
        <div class="category-list-container">
            <ul id="category-management-list" class="category-management-list">
                <!-- Categorias serão carregadas dinamicamente -->
            </ul>
        </div>
        
        <div class="form-actions">
            <button id="modal-add-category-btn" class="btn-save" type="button">
                <i class="fas fa-plus"></i> Nova Categoria
            </button>
            <button id="close-category-modal-btn" class="btn-cancel" type="button">Fechar</button>
        </div>
    </div>
</div>
`;
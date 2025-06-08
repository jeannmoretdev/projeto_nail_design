// Template para a página de agenda - removendo a seção "Próximos Compromissos"
const agendaTemplate = `
<div class="page-header">
    <h2>Agenda</h2>
    <button id="add-appointment-btn" class="action-btn">
        <i class="fas fa-plus"></i> Novo Compromisso
    </button>
</div>

<div class="agenda-container">
    <div class="nail-design-calendar" id="calendar"></div>
</div>

<!-- Modal para adicionar/editar compromisso -->
<div id="appointment-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3 id="modal-title">Novo Compromisso</h3>
        
        <form id="appointment-form">
            <input type="hidden" id="appointment-id">
            
            <div class="form-group">
                <label for="appointment-title">Nome do Compromisso</label>
                <input type="text" id="appointment-title" required>
            </div>
            
            <div class="form-group">
                <label for="appointment-client">Cliente (opcional)</label>
                <select id="appointment-client">
                    <option value="">Selecione um cliente</option>
                    <!-- Clientes serão carregados dinamicamente -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointment-service">Serviço (opcional)</label>
                <select id="appointment-service">
                    <option value="">Selecione um serviço</option>
                    <!-- Serviços serão carregados dinamicamente -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointment-date">Data</label>
                <input type="date" id="appointment-date" required>
            </div>
            
            <div class="form-row">
                <div class="form-group half">
                    <label for="appointment-start-time">Hora de Início</label>
                    <input type="time" id="appointment-start-time" required>
                </div>
                
                <div class="form-group half">
                    <label for="appointment-end-time">Hora de Término</label>
                    <input type="time" id="appointment-end-time">
                </div>
            </div>
            
            <div class="form-group">
                <label for="appointment-price">Preço (R$)</label>
                <input type="text" id="appointment-price" inputmode="decimal">
            </div>
            
            <div class="form-group">
                <label for="appointment-status">Status</label>
                <select id="appointment-status">
                    <option value="agendado">Agendado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointment-notes">Observações</label>
                <textarea id="appointment-notes"></textarea>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-save">Salvar</button>
                <button type="button" class="btn-cancel">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para detalhes do compromisso -->
<div id="appointment-details-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Detalhes do Compromisso</h3>
        
        <div class="appointment-details-content">
            <!-- Conteúdo dos detalhes do compromisso -->
            <div class="detail-item">
                <div class="detail-label">Título</div>
                <div id="detail-title" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Cliente</div>
                <div id="detail-client" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Serviço</div>
                <div id="detail-service" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Data e Hora</div>
                <div id="detail-datetime" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Duração</div>
                <div id="detail-duration" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Preço</div>
                <div id="detail-price" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Local</div>
                <div id="detail-location" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div id="detail-status" class="detail-value"></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Observações</div>
                <div id="detail-notes" class="detail-value"></div>
            </div>
        </div>
        
        <!-- Área para os botões de ação -->
        <div class="appointment-action-buttons">
            <!-- Botões serão adicionados dinamicamente -->
        </div>
    </div>
</div>
`;
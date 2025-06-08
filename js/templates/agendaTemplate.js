// Template para a página de agenda usando FullCalendar
const agendaTemplate = `
<div class="page-header">
    <h2>Agenda</h2>
    <button id="add-appointment-btn" class="action-btn">
        <i class="fas fa-plus"></i> Novo Compromisso
    </button>
</div>

<div id="calendar" class="nail-design-calendar"></div>

<!-- Modal para adicionar/editar compromisso -->
<div id="appointment-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3 id="modal-title">Novo Compromisso</h3>
        
        <form id="appointment-form">
            <input type="hidden" id="appointment-id">
            
            <div class="form-group">
                <label for="appointment-title">Título</label>
                <input type="text" id="appointment-title" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="appointment-date">Data</label>
                    <input type="date" id="appointment-date" required>
                </div>
                
                <div class="form-group">
                    <label for="appointment-start-time">Horário de início</label>
                    <input type="time" id="appointment-start-time" required>
                </div>
                
                <div class="form-group">
                    <label for="appointment-end-time">Horário de término</label>
                    <input type="time" id="appointment-end-time" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="appointment-client">Cliente</label>
                    <div class="select-container">
                        <select id="appointment-client">
                            <option value="">Selecione um cliente</option>
                            <!-- Opções serão carregadas dinamicamente -->
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="appointment-service">Serviço</label>
                    <div class="select-container">
                        <select id="appointment-service">
                            <option value="">Selecione um serviço</option>
                            <!-- Opções serão carregadas dinamicamente -->
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="appointment-price">Preço</label>
                    <div class="price-input">
                        <input type="text" id="appointment-price" placeholder="0,00">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Local</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="appointment-location" value="salao" checked>
                            Salão
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="appointment-location" value="domicilio">
                            Domicílio
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="appointment-status">Status</label>
                    <select id="appointment-status" class="status-select">
                        <option value="agendado">Agendado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
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
`;
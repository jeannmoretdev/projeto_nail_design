// Template para a página de agenda
const agendaTemplate = `
<div class="page-header">
    <h2>Agenda</h2>
    <button id="add-appointment-btn" class="action-btn">
        <i class="fas fa-plus"></i> Novo Compromisso
    </button>
</div>

<div class="agenda-controls">
    <div class="period-navigation">
        <button id="prev-period-btn" class="nav-btn">
            <i class="fas fa-chevron-left"></i>
        </button>
        <h3 id="current-period" class="current-period">Julho 2023</h3>
        <button id="next-period-btn" class="nav-btn">
            <i class="fas fa-chevron-right"></i>
        </button>
        <button id="today-btn" class="today-btn">Hoje</button>
        
        <div class="date-filter">
            <label for="date-filter-input">Ir para:</label>
            <input type="date" id="date-filter-input">
            <button id="date-filter-btn" class="date-filter-btn">Ir</button>
        </div>
    </div>
    
    <div class="view-controls">
        <button id="day-view-btn" class="view-btn">Dia</button>
        <button id="week-view-btn" class="view-btn active">Semana</button>
        <button id="month-view-btn" class="view-btn">Mês</button>
    </div>
</div>

<div id="agenda-container" class="agenda-container">
    <!-- O conteúdo da agenda será renderizado dinamicamente -->
</div>

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
                    <label for="appointment-start-time">Horário Inicial</label>
                    <input type="time" id="appointment-start-time" required>
                </div>
                
                <div class="form-group">
                    <label for="appointment-end-time">Horário Final</label>
                    <input type="time" id="appointment-end-time" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="appointment-client">Cliente</label>
                <select id="appointment-client">
                    <option value="">Selecione um cliente</option>
                    <!-- Clientes serão carregados dinamicamente -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointment-service">Serviço</label>
                <select id="appointment-service">
                    <option value="">Selecione um serviço</option>
                    <!-- Serviços serão carregados dinamicamente -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointment-price">Preço (R$)</label>
                <input type="text" id="appointment-price" inputmode="decimal">
            </div>
            
            <div class="form-group">
                <label>Local</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="appointment-location" value="salao" checked>
                        Salão
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="appointment-location" value="cliente">
                        Casa do Cliente
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="appointment-location" value="outro">
                        Outro
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label for="appointment-status">Status</label>
                <select id="appointment-status">
                    <option value="agendado" selected>Agendado</option>
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
`;
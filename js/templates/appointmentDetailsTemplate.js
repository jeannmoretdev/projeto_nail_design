// Template para o modal de detalhes do compromisso
const appointmentDetailsTemplate = `
<div id="appointment-details-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Detalhes do Compromisso</h3>
        
        <div class="appointment-details-content">
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
        
        <div class="appointment-action-buttons">
            <!-- Botões serão adicionados dinamicamente -->
        </div>
    </div>
</div>
`;
// Configurações globais do aplicativo
const CONFIG = {
    // Configurações do banco de dados
    database: {
        name: 'nailDesignCRM',
        version: 1,
        storeName: 'clients'
    },
    
    // Configurações de UI
    ui: {
        dateFormat: { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        },
        itemsPerPage: 10,
        animations: true
    },
    
    // Mensagens do sistema
    messages: {
        saveSuccess: 'Cliente salvo com sucesso!',
        updateSuccess: 'Cliente atualizado com sucesso!',
        deleteSuccess: 'Cliente excluído com sucesso!',
        deleteConfirm: 'Tem certeza que deseja excluir este cliente?',
        error: 'Ocorreu um erro. Tente novamente.'
    }
};
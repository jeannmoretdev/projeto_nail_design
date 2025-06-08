// Função para inicializar o banco de dados
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NailDesignDB', 3); // Incrementar a versão
        
        request.onerror = (event) => {
            console.error('Erro ao abrir banco de dados:', event.target.error);
            reject(new Error('Não foi possível abrir o banco de dados'));
        };
        
        request.onsuccess = (event) => {
            DB.db = event.target.result;
            console.log('Banco de dados aberto com sucesso');
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Criar ou verificar o object store de clientes
            if (!db.objectStoreNames.contains('clients')) {
                const clientsStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
                clientsStore.createIndex('name', 'name', { unique: false });
            }
            
            // Criar ou verificar o object store de serviços
            if (!db.objectStoreNames.contains('services')) {
                const servicesStore = db.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
                servicesStore.createIndex('name', 'name', { unique: false });
                servicesStore.createIndex('category', 'category', { unique: false });
            }
            
            // Criar ou verificar o object store de compromissos
            if (!db.objectStoreNames.contains('appointments')) {
                const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
                
                // Índices para consultas comuns
                appointmentsStore.createIndex('startDate', 'startDate', { unique: false });
                appointmentsStore.createIndex('endDate', 'endDate', { unique: false });
                appointmentsStore.createIndex('clientId', 'clientId', { unique: false });
                appointmentsStore.createIndex('serviceId', 'serviceId', { unique: false });
                appointmentsStore.createIndex('status', 'status', { unique: false });
            }
        };
    });
}

// Inicializar banco de dados ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initDatabase()
        .then(() => {
            console.log('Banco de dados inicializado com sucesso');
            // Inicializar componentes após o banco de dados estar pronto
            Navigation.init();
            
            // Inicializar o componente ativo por padrão
            const defaultPage = document.querySelector('.page.active');
            if (defaultPage) {
                const pageId = defaultPage.id;
                
                switch (pageId) {
                    case 'clients':
                        ClientsComponent.init();
                        break;
                    case 'services':
                        ServicesComponent.init();
                        break;
                    case 'agenda':
                        AgendaComponent.init();
                        break;
                }
            }
        })
        .catch(error => {
            console.error('Erro ao inicializar banco de dados:', error);
            alert('Erro ao inicializar o aplicativo. Por favor, recarregue a página.');
        });
});
// Classe para gerenciar o banco de dados IndexedDB
class Database {
    constructor() {
        this.dbName = CONFIG.database.name;
        this.dbVersion = CONFIG.database.version;
        this.storeName = CONFIG.database.storeName;
        this.db = null;
    }

    // Inicializa o banco de dados
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('Erro ao abrir o banco de dados:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Cria o object store se não existir
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Cria índices para busca
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('phone', 'phone', { unique: false });
                    objectStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    // Adiciona um novo cliente
    async addClient(client) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Adiciona timestamp de criação
            client.createdAt = new Date().toISOString();
            client.updatedAt = new Date().toISOString();
            
            const request = store.add(client);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                console.error('Erro ao adicionar cliente:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Atualiza um cliente existente
    async updateClient(client) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Atualiza timestamp
            client.updatedAt = new Date().toISOString();
            
            const request = store.put(client);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Erro ao atualizar cliente:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Obtém um cliente pelo ID
    async getClient(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.get(id);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                console.error('Erro ao obter cliente:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Obtém todos os clientes
    async getAllClients() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                console.error('Erro ao obter todos os clientes:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Exclui um cliente pelo ID
    async deleteClient(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Erro ao excluir cliente:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Busca clientes por nome
    async searchClients(query) {
        const allClients = await this.getAllClients();
        
        if (!query) return allClients;
        
        query = query.toLowerCase();
        
        return allClients.filter(client => 
            client.name.toLowerCase().includes(query) || 
            client.phone.includes(query) ||
            client.location.toLowerCase().includes(query) ||
            client.services.toLowerCase().includes(query)
        );
    }
}
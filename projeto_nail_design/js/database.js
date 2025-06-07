// Módulo de Banco de Dados
const DB = {
    db: null,
    
    // Inicializar banco de dados
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('nailDesignerDB', 1);
            
            request.onerror = (event) => {
                console.error('Erro ao abrir banco de dados:', event.target.error);
                reject(new Error('Não foi possível abrir o banco de dados'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Banco de dados aberto com sucesso');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar tabela de clientes se não existir
                if (!db.objectStoreNames.contains('clients')) {
                    const clientsStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
                    
                    // Criar índices para busca
                    clientsStore.createIndex('name', 'name', { unique: false });
                    clientsStore.createIndex('phone', 'phone', { unique: false });
                    clientsStore.createIndex('birthday', 'birthday', { unique: false });
                }
                
                console.log('Banco de dados criado/atualizado com sucesso');
            };
        });
    },
    
    // Operações com clientes
    clients: {
        // Adicionar cliente
        add: function(client) {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readwrite');
                    const store = transaction.objectStore('clients');
                    const request = store.add(client);
                    
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao adicionar cliente: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Atualizar cliente
        update: function(client) {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readwrite');
                    const store = transaction.objectStore('clients');
                    const request = store.put(client);
                    
                    request.onsuccess = () => {
                        resolve(true);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao atualizar cliente: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Excluir cliente
        delete: function(id) {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readwrite');
                    const store = transaction.objectStore('clients');
                    const request = store.delete(id);
                    
                    request.onsuccess = () => {
                        resolve(true);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao excluir cliente: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Obter cliente por ID
        getById: function(id) {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readonly');
                    const store = transaction.objectStore('clients');
                    const request = store.get(id);
                    
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao buscar cliente: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Obter todos os clientes
        getAll: function() {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readonly');
                    const store = transaction.objectStore('clients');
                    const request = store.getAll();
                    
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao buscar clientes: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Buscar clientes
        search: function(query) {
            return new Promise((resolve, reject) => {
                try {
                    // Se não houver consulta, retornar todos
                    if (!query) {
                        return this.getAll().then(resolve).catch(reject);
                    }
                    
                    const transaction = DB.db.transaction(['clients'], 'readonly');
                    const store = transaction.objectStore('clients');
                    const request = store.getAll();
                    
                    request.onsuccess = () => {
                        const clients = request.result;
                        const normalizedQuery = query.toLowerCase();
                        
                        // Filtrar clientes que correspondem à consulta
                        const filteredClients = clients.filter(client => {
                            return (
                                client.name.toLowerCase().includes(normalizedQuery) ||
                                client.phone.includes(normalizedQuery) ||
                                (client.location && client.location.toLowerCase().includes(normalizedQuery)) ||
                                (client.services && client.services.toLowerCase().includes(normalizedQuery)) ||
                                (client.notes && client.notes.toLowerCase().includes(normalizedQuery))
                            );
                        });
                        
                        resolve(filteredClients);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao buscar clientes: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        // Limpar todos os clientes
        clear: function() {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['clients'], 'readwrite');
                    const store = transaction.objectStore('clients');
                    const request = store.clear();
                    
                    request.onsuccess = () => {
                        resolve(true);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao limpar clientes: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
};
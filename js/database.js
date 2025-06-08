// Módulo de Banco de Dados
const DB = {
    db: null,
    
    // Inicializar banco de dados
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('NailDesignDB', 2); // Incrementar a versão
            
            request.onerror = (event) => {
                console.error('Erro ao abrir banco de dados:', event.target.error);
                reject(new Error('Não foi possível abrir o banco de dados'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
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
    },
    
    // Adicionar objeto para gerenciar serviços
    services: {
        add: function(service) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readwrite');
                const store = transaction.objectStore('services');
                const request = store.add(service);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        
        update: function(service) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readwrite');
                const store = transaction.objectStore('services');
                const request = store.put(service);
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        
        delete: function(id) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readwrite');
                const store = transaction.objectStore('services');
                const request = store.delete(id);
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        
        getById: function(id) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readonly');
                const store = transaction.objectStore('services');
                const request = store.get(id);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        
        getAll: function() {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readonly');
                const store = transaction.objectStore('services');
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        
        search: function(query) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readonly');
                const store = transaction.objectStore('services');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    const services = request.result;
                    if (!query) {
                        resolve(services);
                        return;
                    }
                    
                    const lowerQuery = query.toLowerCase();
                    const filtered = services.filter(service => {
                        return (
                            service.name.toLowerCase().includes(lowerQuery) ||
                            (service.category && service.category.toLowerCase().includes(lowerQuery)) ||
                            (service.description && service.description.toLowerCase().includes(lowerQuery))
                        );
                    });
                    
                    resolve(filtered);
                };
                
                request.onerror = () => reject(request.error);
            });
        },
        
        getByCategory: function(category) {
            return new Promise((resolve, reject) => {
                const transaction = DB.db.transaction(['services'], 'readonly');
                const store = transaction.objectStore('services');
                const index = store.index('category');
                const request = index.getAll(category);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        
        // Adicionar função clear
        clear: function() {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = DB.db.transaction(['services'], 'readwrite');
                    const store = transaction.objectStore('services');
                    const request = store.clear();
                    
                    request.onsuccess = () => {
                        resolve(true);
                    };
                    
                    request.onerror = (event) => {
                        reject(new Error('Erro ao limpar serviços: ' + event.target.error));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
};
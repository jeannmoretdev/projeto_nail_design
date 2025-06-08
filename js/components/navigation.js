// Componente de Navegação
const Navigation = {
    init: function() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPage = button.dataset.page;
                
                // Atualizar botões de navegação
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Mostrar página selecionada
                pages.forEach(page => {
                    if (page.id === targetPage) {
                        page.classList.add('active');
                    } else {
                        page.classList.remove('active');
                    }
                });
                
                // Carregar conteúdo específico da página, se necessário
                this.loadPageContent(targetPage);
            });
        });
    },
    
    // Adicionar este método para carregar conteúdo específico da página
    loadPageContent: function(pageId) {
        // Carregar conteúdo específico com base na página selecionada
        switch (pageId) {
            case 'agenda':
                // Inicializar componente de agenda se ainda não foi inicializado
                if (typeof AgendaComponent !== 'undefined' && 
                    document.getElementById('agenda') && 
                    !document.getElementById('agenda').hasAttribute('data-initialized')) {
                    
                    AgendaComponent.init()
                        .then(() => {
                            document.getElementById('agenda').setAttribute('data-initialized', 'true');
                        })
                        .catch(error => {
                            console.error('Erro ao inicializar componente de agenda:', error);
                        });
                }
                break;
                
            // Outros casos podem ser adicionados conforme necessário
        }
    }
};
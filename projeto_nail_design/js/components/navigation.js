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
            });
        });
    }
};
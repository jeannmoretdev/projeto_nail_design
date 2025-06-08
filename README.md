# Nail Design - Sistema de Gerenciamento para Profissionais de Manicure

Um aplicativo web para gerenciamento de clientes, serviços e agendamentos para profissionais de manicure e nail design.

## Funcionalidades Principais

### Gerenciamento de Clientes
- Cadastro completo de clientes com informações de contato
- Armazenamento de preferências e histórico de serviços
- Busca rápida de clientes por nome, telefone ou serviços
- Visualização detalhada do perfil do cliente
- Edição e exclusão de registros de clientes

### Gerenciamento de Serviços
- Cadastro de serviços oferecidos com preços e descrições
- Organização de serviços por categorias personalizáveis
- Gerenciamento de categorias (adicionar, editar, excluir)
- Busca de serviços por nome ou categoria
- Visualização detalhada de cada serviço

### Categorias de Serviços
- Sistema de categorias padrão para organização de serviços:
  - Colocação Fibra
  - Colocação Gel
  - Manutenção Fibra
  - Manutenção Gel
  - Blindagem
- Possibilidade de adicionar categorias personalizadas
- Gerenciamento completo de categorias através de interface modal
- Opção para redefinir categorias para os valores padrão

### Armazenamento de Dados
- Armazenamento local utilizando IndexedDB
- Persistência de dados entre sessões
- Não requer conexão com internet para funcionar
- Dados armazenados diretamente no navegador do usuário

### Interface de Usuário
- Design responsivo adaptado para dispositivos móveis e desktop
- Interface intuitiva e fácil de usar
- Temas claro e escuro disponíveis
- Opções de personalização de fonte e aparência

### Importação e Exportação de Dados
- Importação de dados de exemplo para testar o sistema
- Possibilidade de exportar dados para backup
- Importação de dados a partir de arquivos de backup

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript puro (Vanilla JS)
- IndexedDB para armazenamento de dados
- Aplicação web progressiva (PWA) para instalação no dispositivo
- Não requer frameworks ou bibliotecas externas

## Como Usar

1. Clone o repositório
2. Abra o arquivo `index.html` em seu navegador
3. Comece a cadastrar seus clientes e serviços
4. Os dados serão salvos automaticamente no navegador

## Instalação como PWA

O aplicativo pode ser instalado como um aplicativo progressivo (PWA) em dispositivos móveis e desktops:

1. Acesse o aplicativo pelo navegador
2. No Chrome/Edge: clique no menu (três pontos) e selecione "Instalar aplicativo"
3. No Safari (iOS): toque no ícone de compartilhamento e selecione "Adicionar à Tela de Início"

## Próximas Funcionalidades Planejadas

- Sistema de agendamento com calendário visual
- Histórico de atendimentos por cliente
- Relatórios financeiros e estatísticas
- Sistema de lembretes para clientes
- Galeria de trabalhos realizados

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido por [Jeann Moret](https://github.com/jeannmoretdev)
```

Para criar este arquivo no seu repositório, você pode usar o seguinte comando:

```bash
nano README.md
```

Cole o conteúdo acima e salve o arquivo. Em seguida, adicione-o ao seu repositório Git:

```bash
git add README.md
git commit -m "Adiciona README com descrição do projeto e funcionalidades"
git push
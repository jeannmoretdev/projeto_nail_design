# Nail Design CRM

Um sistema de gerenciamento de clientes (CRM) para profissionais de nail design. Este aplicativo permite cadastrar, visualizar, editar e excluir informações de clientes, com armazenamento local no navegador usando IndexedDB.

## Funcionalidades

- Cadastro de clientes com nome, telefone, local, serviços realizados e data
- Listagem de todos os clientes cadastrados
- Busca de clientes por nome, telefone, local ou serviços
- Visualização detalhada de cada cliente
- Edição de informações de clientes
- Exclusão de clientes
- Armazenamento local dos dados (sem necessidade de servidor)
- Interface responsiva otimizada para iPhone e iPad

## Tecnologias Utilizadas

- HTML5
- CSS3 com Tailwind CSS
- JavaScript puro (Vanilla JS)
- IndexedDB para armazenamento local
- Design responsivo para diferentes dispositivos

## Como Usar

1. Abra o arquivo `index.html` em um navegador web moderno
2. Use o formulário para cadastrar novos clientes
3. Visualize a lista de clientes cadastrados
4. Use a barra de busca para encontrar clientes específicos
5. Clique em "Ver" para visualizar detalhes do cliente
6. Clique em "Editar" para modificar informações do cliente
7. Clique em "Excluir" para remover um cliente

## Compatibilidade

Este aplicativo foi desenvolvido com foco especial em compatibilidade com:
- Safari no iPhone 7
- Safari no iPhone 12
- Safari no iPad 12

## Estrutura do Projeto

```
projeto_nail_design/
├── index.html          # Página principal do aplicativo
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   ├── app.js          # Lógica principal da aplicação
│   ├── config.js       # Configurações globais
│   └── database.js     # Gerenciamento do banco de dados
└── README.md           # Documentação do projeto
```

## Desenvolvimento

Para modificar o projeto:

1. Edite as variáveis de cores e estilos em `css/styles.css`
2. Ajuste as configurações globais em `js/config.js`
3. Modifique a lógica de banco de dados em `js/database.js`
4. Altere a interface e comportamento em `js/app.js`

## Licença

Este projeto é de uso livre.
```

Vamos também criar um arquivo .gitignore para o projeto:

```:.gitignore
# Dependências
node_modules/
vendor/

# Arquivos de ambiente
.env
.env.local
.env.*.local

# Arquivos de build
/dist
/build

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Arquivos do sistema operacional
.DS_Store
Thumbs.db

# Arquivos de IDE
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# Arquivos temporários
*.tmp
*.swp
```

Agora, vamos adicionar os arquivos ao Git e fazer o commit:

```bash
git add .
```

```bash
git commit -m "Implementação inicial do CRM para Nail Design"
```

```bash
git push origin main
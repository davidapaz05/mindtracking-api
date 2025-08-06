# MindTrack API

MindTrack é uma API robusta para suporte emocional e orientação psicológica. O sistema oferece questionários diários para acompanhamento emocional, gera diagnósticos personalizados e conta com a **Athena**, uma inteligência artificial especializada em atendimento psicológico que interage via chat para oferecer acolhimento, dicas e reflexões personalizadas.

## ✨ Visão Geral

- **Questionários Diários**: Sistema automatizado de envio de questionários para monitoramento emocional contínuo
- **Diagnósticos Inteligentes**: Geração automática de notas e diagnósticos emocionais baseados nas respostas
- **Athena - IA Psicológica**: Chatbot especializado que utiliza técnicas avançadas de psicologia para acolher, orientar e sugerir práticas de bem-estar
- **Sistema de Autenticação Seguro**: Cadastro, login e autenticação JWT com verificação de email
- **Acompanhamento de Progresso**: Sistema de pontuação e nível emocional para acompanhar evolução

## 🚀 Funcionalidades Principais

### 🤖 **Chatbot Athena**
- Suporte emocional 24/7 via inteligência artificial
- Dicas personalizadas baseadas no perfil do usuário
- Diagnóstico emocional automático após 10 interações
- Abordagem psicológica baseada em técnicas freudianas e conceitos de Jung

### 📊 **Sistema de Questionários**
- **Questionário Inicial**: Avaliação completa do perfil emocional do usuário
- **Questionários Diários**: Monitoramento contínuo do bem-estar
- **Análise Automática**: Geração de diagnósticos e sugestões baseados nas respostas

### 🔐 **Autenticação e Segurança**
- Registro com verificação de email obrigatória
- Login seguro com JWT
- Recuperação de senha via email
- Criptografia de senhas com bcrypt
- Middleware de autenticação para rotas protegidas

### 📈 **Acompanhamento Emocional**
- Sistema de pontuação emocional
- Histórico de diagnósticos
- Evolução do bem-estar ao longo do tempo
- Dicas personalizadas baseadas no progresso

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js** (v20+) - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização

### **Inteligência Artificial**
- **OpenAI** - Integração com IA
- **gpt-4o-mini** - Modelo de linguagem avançado

### **Comunicação**
- **Nodemailer** - Envio de emails
- **CORS** - Cross-origin resource sharing

### **Segurança**
- **bcrypt** - Criptografia de senhas
- **dotenv** - Gerenciamento de variáveis de ambiente

### **DevOps**
- **Docker** - Containerização
- **Nodemon** - Desenvolvimento com hot-reload

## 📦 Instalação e Configuração

### **Pré-requisitos**
- [Node.js](https://nodejs.org/) (v20 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 ou superior)
- [Git](https://git-scm.com/)

### **1. Clone o Repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd MindTrack-API
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**
Crie um arquivo `.env` na pasta `config/` com o seguinte conteúdo:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_HOST=localhost
DB_NAME=mindtrack_db
PORTA=5432

# Configurações de Segurança
JWT_KEY=sua_chave_secreta_jwt_super_segura

# Configurações da IA (Groq)
API_KEY=sua_chave_api_groq

# Configurações de Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail
```

### **4. Configure o Banco de Dados**
```sql
-- Crie o banco de dados
CREATE DATABASE mindtrack_db;

-- Execute os scripts de criação das tabelas
-- (consulte a documentação do banco para os scripts completos)
```

### **5. Inicie a Aplicação**
```bash
# Desenvolvimento
npm start

# Produção
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 🐳 Docker (Opcional)

### **Build da Imagem**
```bash
docker build -t mindtrack-api .
```

### **Executar Container**
```bash
docker run -p 3000:3000 --env-file ./config/.env mindtrack-api
```

## 📚 Documentação da API

### **Base URL**
```
http://localhost:3000
```

### **Endpoints Principais**

#### **🔐 Autenticação**
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/verify-email` - Verificação de email
- `POST /auth/recuperar-senha` - Solicitar recuperação de senha
- `POST /auth/verificar-codigo` - Verificar código de recuperação
- `POST /auth/redefinir-senha` - Redefinir senha
- `DELETE /auth/delete-account` - Excluir conta (autenticado)

#### **🤖 Chat com Athena**
- `POST /api/chat` - Enviar mensagem para Athena (autenticado)
- `GET /api/diagnostico` - Obter diagnóstico mais recente (autenticado)

#### **📊 Questionários**
- `POST /questionario/inicial` - Enviar questionário inicial (autenticado)
- `GET /questionario/diario` - Obter questionário diário (autenticado)
- `POST /questionario/diario` - Enviar resposta do questionário diário (autenticado)
- `GET /questionario/historico` - Obter histórico de questionários (autenticado)

### **Exemplo de Uso**

#### **Registro de Usuário**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123",
    "confirmarSenha": "senha123",
    "data_nascimento": "1990-01-01"
  }'
```

#### **Chat com Athena**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "message": "Estou me sentindo ansioso hoje"
  }'
```

## 🏗️ Estrutura do Projeto

```
MindTrack-API/
├── config/                    # Configurações do sistema
│   ├── database.js           # Configuração PostgreSQL
│   ├── emailConfig.js        # Configuração Nodemailer
│   ├── groqConfig.js         # Configuração Groq SDK
│   └── .env                  # Variáveis de ambiente
├── controllers/              # Lógica de negócio
│   ├── authController.js     # Autenticação e usuários
│   ├── chatController.js     # Chat com Athena
│   ├── questionarioController.js      # Questionários gerais
│   └── questionarioDiarioController.js # Questionários diários
├── middlewares/              # Interceptadores
│   └── authenticate.js       # Autenticação JWT
├── routes/                   # Definição de rotas
│   ├── authRoutes.js         # Rotas de autenticação
│   ├── chatRoutes.js         # Rotas do chat
│   └── questionarioRoutes.js # Rotas de questionários
├── templates/                # Templates de email
│   └── emailTemplates.js     # Templates HTML
├── server.js                 # Servidor principal
├── Dockerfile               # Configuração Docker
├── package.json             # Dependências e scripts
└── README.md               # Documentação
```

## 🤖 Sobre a Athena

A **Athena** é uma inteligência artificial especializada em atendimento psicológico, desenvolvida com base em:

- **Técnicas Freudianas**: Análise de questões emocionais profundas
- **Conceitos de Jung**: Arquétipos e análise da psique
- **Terapias Modernas**: TCC, meditação, estoicismo e escrita reflexiva
- **Acolhimento Emocional**: Respostas empáticas e personalizadas

### **Limitações Importantes**
- **Não substitui profissionais**: A Athena é uma ferramenta de apoio, não um substituto para terapia profissional
- **Foco psicológico**: Especializada apenas em suporte emocional e psicológico
- **Redirecionamento**: Casos graves são direcionados para ajuda profissional

## 🔒 Segurança

- **Criptografia**: Senhas criptografadas com bcrypt
- **JWT**: Tokens seguros para autenticação
- **Verificação de Email**: Confirmação obrigatória de email
- **Validação**: Validação rigorosa de dados de entrada
- **CORS**: Configuração segura para requisições cross-origin

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📊 Monitoramento

- **Logs**: Sistema de logs para debugging
- **Métricas**: Monitoramento de performance
- **Erros**: Tratamento centralizado de erros

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. **Fork** este repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### **Padrões de Commit**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Issues**: [GitHub Issues](link-para-issues)
- **Documentação**: [Wiki do Projeto](link-para-wiki)
- **Email**: suporte@mindtrack.com

## 🙏 Agradecimentos

- **Groq** pela API de IA
- **PostgreSQL** pelo banco de dados robusto
- **Comunidade Node.js** pelas ferramentas incríveis

---

**Desenvolvido com ❤️ pela equipe MindTrack**

# 🔄 File Converter API

Uma API robusta e completa para conversão de documentos, OCR (Reconhecimento Óptico de Caracteres) e compressão de arquivos, desenvolvida em TypeScript com Node.js e Express.

## 🎯 Objetivo

A **File Converter API** foi criada para fornecer uma solução unificada e eficiente para processamento de documentos, oferecendo:

- **Conversão de documentos** entre formatos populares (PDF ↔ DOCX)
- **Extração de texto** de imagens através de OCR avançado
- **Compressão inteligente** de arquivos PDF
- **Sistema de autenticação** baseado em API Keys
- **Rate limiting** para controle de uso e performance
- **Interface RESTful** simples e intuitiva

## ✨ Funcionalidades

### 📄 Conversão de Documentos
- **PDF → DOCX**: Extrai texto de PDFs e gera documentos Word editáveis
- **DOCX → PDF**: Converte documentos Word em arquivos PDF preservando a formatação
- Suporte a arquivos até **10MB**
- Processamento assíncrono eficiente

### 🔍 OCR (Optical Character Recognition)
- Extração de texto de imagens em **+100 idiomas**
- Suporte a múltiplos formatos: JPG, PNG, BMP, TIFF, WEBP
- Retorna texto extraído com **índice de confiança**
- Otimizado com Tesseract.js

### 🗜️ Compressão de PDF
- **3 níveis de compressão**: low, medium, high
- Redução significativa do tamanho dos arquivos
- Preservação da qualidade visual
- Estatísticas detalhadas de compressão

### 🔐 Sistema de Segurança
- **Autenticação via API Key** para todos os endpoints protegidos
- **Rate limiting** personalizável por usuário
- **Validação rigorosa** de inputs e formatos
- **Limpeza automática** de arquivos temporários

### 👤 Gerenciamento de Usuários
- Registro simples com email único
- Geração automática de API Keys seguras
- Perfil de usuário com histórico de requests
- Monitoramento de uso individual

## 🚀 Tecnologias Utilizadas

### Core
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express.js** - Framework web minimalista

### Banco de Dados
- **Prisma** - ORM moderno e type-safe
- **SQLite** - Banco de dados leve e eficiente

### Processamento de Arquivos
- **mammoth** - Leitura de arquivos DOCX
- **pdf-lib** - Manipulação de PDFs
- **docx** - Geração de documentos Word
- **tesseract.js** - OCR engine
- **multer** - Upload de arquivos

### Segurança & Performance
- **helmet** - Headers de segurança HTTP
- **cors** - Cross-Origin Resource Sharing
- **compression** - Compressão gzip
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📚 Endpoints da API

### 👤 Usuários
```
POST   /api/users/register     # Registrar novo usuário
GET    /api/users/profile      # Obter perfil do usuário (🔒)
```

### 🔄 Conversão
```
GET    /api/convert/status     # Status das conversões suportadas
POST   /api/convert/convert    # Converter arquivo (🔒)
```

### 🔍 OCR
```
POST   /api/ocr/extract        # Extrair texto de imagem (🔒)
GET    /api/ocr/languages      # Listar idiomas suportados
```

### 🗜️ Compressão
```
POST   /api/compress/pdf       # Comprimir arquivo PDF (🔒)
GET    /api/compress/info      # Informações sobre compressão
```

### ⚡ Rate Limit
```
GET    /api/rate-limit/status  # Verificar status do rate limit (🔒)
```

> **🔒** = Endpoint protegido (requer API Key)

## 🛠️ Instalação e Configuração

### Pré-requisitos
- **Node.js** (v18+)
- **npm** ou **yarn**
- **Git**

### 1. Clone o repositório
```bash
git clone https://github.com/emanuel-malungo/file-converter-api.git
cd file-converter-api
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Crie um arquivo .env na raiz do projeto
touch .env
```

Adicione as seguintes variáveis:
```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests por janela
```

### 4. Configure o banco de dados
```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate dev

# (Opcional) Visualize o banco
npx prisma studio
```

### 5. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`

## 📖 Como Usar

### 1. Registrar um usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "seu-email@exemplo.com"}'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "seu-email@exemplo.com",
      "apiKey": "API_xxxxxxxxxxxxxxxxxx",
      "createdAt": "2025-09-02T19:54:06.000Z"
    }
  }
}
```

### 2. Converter um arquivo
```bash
curl -X POST http://localhost:3000/api/convert/convert \
  -H "Authorization: API_xxxxxxxxxxxxxxxxxx" \
  -F "file=@documento.pdf" \
  -F "targetFormat=docx"
```

### 3. Extrair texto de imagem (OCR)
```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Authorization: API_xxxxxxxxxxxxxxxxxx" \
  -F "image=@imagem.jpg" \
  -F "language=por"
```

### 4. Comprimir PDF
```bash
curl -X POST http://localhost:3000/api/compress/pdf \
  -H "Authorization: API_xxxxxxxxxxxxxxxxxx" \
  -F "file=@documento.pdf" \
  -F "level=medium"
```

## 📁 Estrutura do Projeto

```
file-converter-api/
├── 📁 prisma/                 # Schema e migrações do banco
│   ├── schema.prisma
│   ├── dev.db
│   └── 📁 migrations/
├── 📁 src/
│   ├── server.ts              # Ponto de entrada da aplicação
│   ├── 📁 config/             # Configurações
│   ├── 📁 controllers/        # Lógica de negócio
│   ├── 📁 core/              # Classes principais (Converter)
│   ├── 📁 interfaces/        # Definições TypeScript
│   ├── 📁 middlewares/       # Middlewares (auth, rate limit)
│   ├── 📁 routes/            # Definição das rotas
│   ├── 📁 services/          # Serviços externos
│   ├── 📁 utils/             # Utilitários
│   └── 📁 validations/       # Validações
├── 📁 temp/                  # Arquivos temporários
│   └── 📁 uploads/
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Configurações Avançadas

### Rate Limiting
O sistema possui rate limiting inteligente que pode ser configurado:
- **Janela de tempo**: Período para contabilizar requests
- **Máximo de requests**: Limite por usuário/janela
- **Headers informativos**: Retorna status do limite

### Limpeza Automática
- Arquivos temporários são removidos automaticamente
- Sistema de cleanup em background
- Proteção contra acúmulo de arquivos

### Validações
- **Tipos de arquivo**: Validação rigorosa de extensões
- **Tamanho máximo**: 10MB por arquivo
- **Formatos suportados**: Lista bem definida
- **Headers de segurança**: Helmet configurado

## 🔒 Segurança

A API implementa várias camadas de segurança:

- **API Keys únicas** para cada usuário
- **Rate limiting** para prevenir abuso
- **Validação de entrada** em todos os endpoints
- **Headers de segurança** (Helmet)
- **CORS** configurado adequadamente
- **Limpeza automática** de arquivos temporários

## 🚦 Monitoramento

### Status da API
```bash
curl http://localhost:3000/api/convert/status
```

### Rate Limit Status
```bash
curl -H "Authorization: API_xxxxxxxxxxxxxxxxxx" \
     http://localhost:3000/api/rate-limit/status
```

### Perfil do usuário
```bash
curl -H "Authorization: API_xxxxxxxxxxxxxxxxxx" \
     http://localhost:3000/api/users/profile
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a [Licença ISC](LICENSE).

## 👨‍💻 Autor

**Emanuel Malungo**
- GitHub: [@emanuel-malungo](https://github.com/emanuel-malungo)
- Email: [Seu email aqui]

---

⭐ **Se este projeto foi útil, considere dar uma estrela no GitHub!**
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Converter API',
      version: '1.0.0',
      description: 'API para conversão, compressão e OCR de arquivos',
      contact: {
        name: 'Emanuel Malungo',
        url: 'https://github.com/emanuel-malungo/file-converter-api',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Chave da API para autenticação',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário',
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            apiKey: {
              type: 'string',
              description: 'Chave da API do usuário',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização do usuário',
            },
          },
        },
        RateLimit: {
          type: 'object',
          properties: {
            requestsRemaining: {
              type: 'integer',
              description: 'Número de requisições restantes',
            },
            resetTime: {
              type: 'string',
              format: 'date-time',
              description: 'Hora em que o limite será resetado',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
        ConversionRequest: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Arquivo para conversão',
            },
            targetFormat: {
              type: 'string',
              enum: ['pdf', 'docx', 'txt', 'png', 'jpg'],
              description: 'Formato de destino para conversão',
            },
          },
          required: ['file', 'targetFormat'],
        },
        CompressionRequest: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Arquivo para compressão',
            },
            quality: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Qualidade da compressão (1-100)',
            },
          },
          required: ['file'],
        },
        OCRRequest: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Imagem para OCR',
            },
            language: {
              type: 'string',
              default: 'eng',
              description: 'Idioma para reconhecimento de texto',
            },
          },
          required: ['file'],
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Caminhos para os arquivos com anotações JSDoc
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'File Converter API Documentation',
  }));
  
  // Endpoint para obter o JSON da especificação
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;

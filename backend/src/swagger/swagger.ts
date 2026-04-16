import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Code-to-BRD Agent API',
      version: '1.0.0',
      description:
        'REST API for cloning GitHub repositories, parsing AST with tree-sitter, ' +
        'extracting feature-level requirements, and generating Business Requirements Documents.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
    components: {
      schemas: {
        CloneRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              example: 'https://github.com/owner/repo',
              description: 'Public GitHub repository HTTPS URL',
            },
          },
        },
        RepoInfo: {
          type: 'object',
          properties: {
            repoId: { type: 'string', example: 'owner-repo' },
            name: { type: 'string', example: 'owner/repo' },
            repoPath: { type: 'string', example: '/data/repos/owner-repo' },
            clonedAt: { type: 'string', format: 'date-time' },
          },
        },
        ParseRequest: {
          type: 'object',
          required: ['repoId'],
          properties: {
            repoId: { type: 'string', example: 'owner-repo' },
          },
        },
        ParseResponse: {
          type: 'object',
          properties: {
            repoId: { type: 'string' },
            languages: { type: 'array', items: { type: 'string' } },
            fileCount: { type: 'integer' },
            parsedFiles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filePath: { type: 'string' },
                  language: { type: 'string' },
                  functions: { type: 'array', items: { type: 'string' } },
                  classes: { type: 'array', items: { type: 'string' } },
                  imports: { type: 'array', items: { type: 'string' } },
                  exports: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            astSummary: { type: 'string' },
          },
        },
        FeaturesRequest: {
          type: 'object',
          required: ['repoId'],
          properties: {
            repoId: { type: 'string', example: 'owner-repo' },
            model: {
              type: 'string',
              example: 'claude-sonnet-4-5',
              description: 'Anthropic model ID to use (defaults to ANTHROPIC_MODEL env var)',
            },
          },
        },
        FeaturesResponse: {
          type: 'object',
          properties: {
            jobId: { type: 'string', format: 'uuid' },
            repoId: { type: 'string' },
            features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  featureId: { type: 'string' },
                  name: { type: 'string' },
                  requirements: { type: 'array', items: { type: 'string' } },
                  traceability: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        requirementId: { type: 'string' },
                        classRef: { type: 'string' },
                        layer: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            rawText: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BrdRequest: {
          type: 'object',
          required: ['repoId', 'jobId'],
          properties: {
            repoId: { type: 'string', example: 'owner-repo' },
            jobId: { type: 'string', format: 'uuid' },
            model: { type: 'string', example: 'claude-sonnet-4-5' },
          },
        },
        BrdResponse: {
          type: 'object',
          properties: {
            brdId: { type: 'string', format: 'uuid' },
            repoId: { type: 'string' },
            filename: { type: 'string', example: 'owner-repo-BRD-2026-04-16.md' },
            downloadUrl: { type: 'string', example: '/api/brd/uuid/download' },
            previewText: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, '../routes/*.ts'), path.resolve(__dirname, '../routes/*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);

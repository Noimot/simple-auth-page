const swaggerDocs = {
    swaggerDefinition: {
      info: {
        title: 'Tasks Documentation',
        version: '1.0.0',
        description: 'This is a simple CRUD API documentation for tasks',
      },
      basePath: '/', // 
    },
    apis: ['./*.js'], 
  };
  
  module.exports = swaggerDocs;
  
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Food & Home API',
    version: '1.0.0',
    description: 'Product and account APIs for the Food & Home store.',
  },
  servers: [{ url: '/', description: 'The same domain hosting Swagger UI' }],
  tags: [
    { name: 'Health' },
    { name: 'Products' },
    { name: 'Auth' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check backend health',
        responses: { '200': { description: 'The backend is running' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['FOOD_FRESH', 'FOOD_PACKAGED', 'FOOD_BEVERAGE', 'HOME_KITCHEN', 'HOME_CLEANING', 'HOME_APPLIANCE'] } },
          { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { '200': { description: 'Products and pagination information' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '201': { description: 'Product created' }, '400': { description: 'Invalid data' }, '409': { description: 'SKU or slug already exists' } },
      },
    },
    '/api/products/search': {
      get: {
        tags: ['Products'],
        summary: 'Search products by name, description, or SKU',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Search results' }, '400': { description: 'Missing q parameter' } },
      },
    },
    '/api/products/categories': {
      get: { tags: ['Products'], summary: 'List product categories', responses: { '200': { description: 'Product categories' } } },
    },
    '/api/products/bulk': {
      post: {
        tags: ['Products'],
        summary: 'Create multiple products (up to 100)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['items'], properties: { items: { type: 'array', maxItems: 100, items: { $ref: '#/components/schemas/ProductInput' } } } } } } },
        responses: { '201': { description: 'Products created' }, '400': { description: 'Invalid data' } },
      },
    },
    '/api/products/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Products'], summary: 'Get product details', responses: { '200': { description: 'Product details' }, '404': { description: 'Product not found' } } },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '200': { description: 'Product updated' }, '400': { description: 'Invalid data' }, '404': { description: 'Product not found' } },
      },
      delete: { tags: ['Products'], summary: 'Delete a product', responses: { '204': { description: 'Product deleted' }, '404': { description: 'Product not found' } } },
    },
    '/api/products/{id}/stock': {
      patch: {
        tags: ['Products'],
        summary: 'Update product stock',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['stock'], properties: { stock: { type: 'integer', minimum: 0 } } } } } },
        responses: { '200': { description: 'Stock updated' }, '400': { description: 'Invalid stock value' }, '404': { description: 'Product not found' } },
      },
    },
    '/api/products/{id}/active': {
      post: {
        tags: ['Products'],
        summary: 'Activate or deactivate a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } } } } } },
        responses: { '200': { description: 'Product status updated' }, '400': { description: 'Invalid isActive value' }, '404': { description: 'Product not found' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register an account',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } },
        responses: { '201': { description: 'Account and token' }, '400': { description: 'Invalid email or password' }, '409': { description: 'Email is already in use' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } },
        responses: { '200': { description: 'Account and token' }, '401': { description: 'Invalid login credentials' } },
      },
    },
  },
  components: {
    schemas: {
      ProductInput: {
        type: 'object',
        required: ['sku', 'name', 'slug', 'description', 'category', 'price', 'unit', 'imageKey'],
        properties: {
          sku: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['FOOD_FRESH', 'FOOD_PACKAGED', 'FOOD_BEVERAGE', 'HOME_KITCHEN', 'HOME_CLEANING', 'HOME_APPLIANCE'] },
          price: { type: 'integer', minimum: 0 },
          compareAtPrice: { type: 'integer', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          unit: { type: 'string' },
          imageKey: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      AuthInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
          name: { type: 'string' },
        },
      },
    },
  },
};

export default openApiSpec;

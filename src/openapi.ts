const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Food & Home API',
    version: '1.0.0',
    description: 'API sản phẩm và tài khoản cho cửa hàng Food & Home.',
  },
  servers: [{ url: '/', description: 'Cùng domain đang mở Swagger UI' }],
  tags: [
    { name: 'Health' },
    { name: 'Products' },
    { name: 'Auth' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra trạng thái backend',
        responses: { '200': { description: 'Backend đang hoạt động' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Danh sách sản phẩm',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['FOOD_FRESH', 'FOOD_PACKAGED', 'FOOD_BEVERAGE', 'HOME_KITCHEN', 'HOME_CLEANING', 'HOME_APPLIANCE'] } },
          { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { '200': { description: 'Danh sách sản phẩm và thông tin phân trang' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Tạo sản phẩm',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '201': { description: 'Đã tạo sản phẩm' }, '400': { description: 'Dữ liệu không hợp lệ' }, '409': { description: 'SKU hoặc slug đã tồn tại' } },
      },
    },
    '/api/products/search': {
      get: {
        tags: ['Products'],
        summary: 'Tìm sản phẩm theo tên, mô tả hoặc SKU',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Kết quả tìm kiếm' }, '400': { description: 'Thiếu q' } },
      },
    },
    '/api/products/categories': {
      get: { tags: ['Products'], summary: 'Danh sách danh mục', responses: { '200': { description: 'Các danh mục sản phẩm' } } },
    },
    '/api/products/bulk': {
      post: {
        tags: ['Products'],
        summary: 'Tạo nhiều sản phẩm (tối đa 100)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['items'], properties: { items: { type: 'array', maxItems: 100, items: { $ref: '#/components/schemas/ProductInput' } } } } } } },
        responses: { '201': { description: 'Số sản phẩm đã tạo' }, '400': { description: 'Dữ liệu không hợp lệ' } },
      },
    },
    '/api/products/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Products'], summary: 'Chi tiết sản phẩm', responses: { '200': { description: 'Thông tin sản phẩm' }, '404': { description: 'Không tìm thấy' } } },
      put: {
        tags: ['Products'],
        summary: 'Cập nhật sản phẩm',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '200': { description: 'Đã cập nhật' }, '400': { description: 'Dữ liệu không hợp lệ' }, '404': { description: 'Không tìm thấy' } },
      },
      delete: { tags: ['Products'], summary: 'Xóa sản phẩm', responses: { '204': { description: 'Đã xóa' }, '404': { description: 'Không tìm thấy' } } },
    },
    '/api/products/{id}/stock': {
      patch: {
        tags: ['Products'],
        summary: 'Cập nhật tồn kho',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['stock'], properties: { stock: { type: 'integer', minimum: 0 } } } } } },
        responses: { '200': { description: 'Đã cập nhật tồn kho' }, '400': { description: 'Tồn kho không hợp lệ' }, '404': { description: 'Không tìm thấy' } },
      },
    },
    '/api/products/{id}/active': {
      post: {
        tags: ['Products'],
        summary: 'Bật hoặc tắt sản phẩm',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } } } } } },
        responses: { '200': { description: 'Đã cập nhật trạng thái' }, '400': { description: 'isActive không hợp lệ' }, '404': { description: 'Không tìm thấy' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } },
        responses: { '201': { description: 'Tài khoản và token' }, '400': { description: 'Email hoặc mật khẩu không hợp lệ' }, '409': { description: 'Email đã được sử dụng' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } },
        responses: { '200': { description: 'Tài khoản và token' }, '401': { description: 'Thông tin đăng nhập không đúng' } },
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

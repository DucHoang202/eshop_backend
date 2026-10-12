import { Category, Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../db';

const router = Router();
const categories = new Set<string>(Object.values(Category));

function validProduct(body: Record<string, unknown>): string | null {
  for (const field of ['sku', 'name', 'slug', 'description', 'unit', 'imageKey']) {
    if (typeof body[field] !== 'string' || !body[field]) return `${field} là bắt buộc`;
  }
  if (typeof body.price !== 'number' || body.price < 0) return 'price phải là số không âm';
  if (!categories.has(String(body.category))) return 'category không hợp lệ';
  if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) return 'stock phải là số không âm';
  return null;
}

function toProductData(body: Record<string, unknown>): Prisma.ProductUncheckedCreateInput {
  return {
    sku: body.sku as string,
    name: body.name as string,
    slug: body.slug as string,
    description: body.description as string,
    category: body.category as Category,
    price: body.price as number,
    unit: body.unit as string,
    imageKey: body.imageKey as string,
    ...(typeof body.compareAtPrice === 'number' ? { compareAtPrice: body.compareAtPrice } : {}),
    ...(typeof body.stock === 'number' ? { stock: body.stock } : {}),
    ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
  };
}

// 1. Danh sách món ăn và đồ gia dụng, có phân trang/lọc danh mục.
router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  if (category && !categories.has(category)) return res.status(400).json({ error: 'category không hợp lệ' });
  const where: Prisma.ProductWhereInput = {
    ...(req.query.includeInactive === 'true' ? {} : { isActive: true }),
    ...(category ? { category: category as Category } : {}),
  };
  try {
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, page, limit, total });
} catch (error) {
  console.error('GET /products ERROR:', error);
  res.status(500).json({ error: 'Không thể tải sản phẩm' });
}
});

// 2. Tìm kiếm theo tên, mô tả hoặc SKU.
router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.status(400).json({ error: 'Tham số q là bắt buộc' });
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true, OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ] }, take: 50, orderBy: { name: 'asc' },
    });
    res.json({ items, total: items.length });
  } catch { res.status(500).json({ error: 'Không thể tìm sản phẩm' }); }
});

// 3. Liệt kê danh mục.
router.get('/categories', (_req, res) => res.json(Object.values(Category).map(value => ({ value }))));

// 4. Tạo sản phẩm (POST #1).
router.post('/', async (req, res) => {
  const error = validProduct(req.body);
  if (error) return res.status(400).json({ error });
  try { return res.status(201).json(await prisma.product.create({ data: toProductData(req.body) })); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'SKU hoặc slug đã tồn tại' });
    return res.status(500).json({ error: 'Không thể tạo sản phẩm' });
  }
});

// 5. Tạo nhiều sản phẩm (POST #2).
router.post('/bulk', async (req, res) => {
  if (!Array.isArray(req.body?.items) || req.body.items.length === 0 || req.body.items.length > 100) return res.status(400).json({ error: 'items phải là mảng gồm 1-100 sản phẩm' });
  for (const item of req.body.items) {
    const error = validProduct(item);
    if (error) return res.status(400).json({ error });
  }
  try {
    const result = await prisma.product.createMany({ data: req.body.items.map(toProductData), skipDuplicates: true });
    return res.status(201).json({ created: result.count });
  } catch { return res.status(500).json({ error: 'Không thể tạo sản phẩm' }); }
});

// 6. Chi tiết sản phẩm theo ID.
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return res.json(product);
  } catch { return res.status(500).json({ error: 'Không thể tải sản phẩm' }); }
});

// 7. Cập nhật sản phẩm (POST #3 là endpoint trạng thái phía dưới).
router.put('/:id', async (req, res) => {
  const error = validProduct(req.body);
  if (error) return res.status(400).json({ error });
  try { return res.json(await prisma.product.update({ where: { id: req.params.id }, data: toProductData(req.body) })); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'SKU hoặc slug đã tồn tại' });
    return res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
  }
});

// 8. Cập nhật tồn kho.
router.patch('/:id/stock', async (req, res) => {
  const stock = req.body?.stock;
  if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: 'stock phải là số nguyên không âm' });
  try { return res.json(await prisma.product.update({ where: { id: req.params.id }, data: { stock } })); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return res.status(500).json({ error: 'Không thể cập nhật tồn kho' });
  }
});

// 9. Bật/tắt hiển thị sản phẩm (POST #3).
router.post('/:id/active', async (req, res) => {
  if (typeof req.body?.isActive !== 'boolean') return res.status(400).json({ error: 'isActive phải là true hoặc false' });
  try { return res.json(await prisma.product.update({ where: { id: req.params.id }, data: { isActive: req.body.isActive } })); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
  }
});

// 10. Xóa sản phẩm.
router.delete('/:id', async (req, res) => {
  try { await prisma.product.delete({ where: { id: req.params.id } }); return res.status(204).send(); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return res.status(500).json({ error: 'Không thể xóa sản phẩm' });
  }
});

export default router;
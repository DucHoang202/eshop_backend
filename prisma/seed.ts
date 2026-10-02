import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

// imageKey trỏ tới object key trên S3 (đã upload sẵn qua trang admin trong thực tế)
const products = [
  { sku: "FF-001", name: "Rau muống hữu cơ", category: Category.FOOD_FRESH, price: 15000, unit: "bó", stock: 120, imageKey: "products/rau-muong.jpg" },
  { sku: "FF-002", name: "Ức gà tươi", category: Category.FOOD_FRESH, price: 89000, unit: "kg", stock: 60, imageKey: "products/uc-ga.jpg" },
  { sku: "FF-003", name: "Cá basa fillet", category: Category.FOOD_FRESH, price: 65000, unit: "kg", stock: 40, imageKey: "products/ca-basa.jpg" },
  { sku: "FP-001", name: "Mì gói Hảo Hảo (thùng)", category: Category.FOOD_PACKAGED, price: 120000, unit: "thùng", stock: 200, imageKey: "products/mi-hao-hao.jpg" },
  { sku: "FP-002", name: "Gạo ST25", category: Category.FOOD_PACKAGED, price: 32000, unit: "kg", stock: 300, imageKey: "products/gao-st25.jpg" },
  { sku: "FB-001", name: "Nước cam ép nguyên chất", category: Category.FOOD_BEVERAGE, price: 45000, unit: "chai 1L", stock: 80, imageKey: "products/nuoc-cam.jpg" },
  { sku: "HK-001", name: "Nồi chiên không dầu 5L", category: Category.HOME_APPLIANCE, price: 1290000, compareAtPrice: 1590000, unit: "cái", stock: 25, imageKey: "products/noi-chien.jpg" },
  { sku: "HK-002", name: "Bộ dao inox 6 món", category: Category.HOME_KITCHEN, price: 350000, unit: "bộ", stock: 50, imageKey: "products/bo-dao.jpg" },
  { sku: "HC-001", name: "Nước lau sàn hương chanh", category: Category.HOME_CLEANING, price: 55000, unit: "chai 1.5L", stock: 90, imageKey: "products/nuoc-lau-san.jpg" },
  { sku: "HA-001", name: "Máy xay sinh tố đa năng", category: Category.HOME_APPLIANCE, price: 750000, unit: "cái", stock: 35, imageKey: "products/may-xay.jpg" },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...p,
        slug: p.sku.toLowerCase(),
        description: `${p.name} chất lượng cao, giao nhanh trong ngày.`,
      },
    });
  }
  // Tạo sẵn 1 tài khoản ADMIN để đăng nhập vào /admin/products upload ảnh.
  // Đổi mật khẩu này ngay sau lần deploy đầu tiên!
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@freshmart.vn" },
    update: {},
    create: {
      email: "admin@freshmart.vn",
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`Đã seed ${products.length} sản phẩm mẫu + 1 tài khoản admin (admin@freshmart.vn / Admin@123).`);
}

main().finally(() => prisma.$disconnect());

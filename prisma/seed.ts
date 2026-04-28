import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ============= 1. CREATE SHOP SETTINGS =============
  console.log("📋 Creating shop settings...");
  const shopSettings = await prisma.shopSettings.upsert({
    where: { id: "shop_1" },
    update: {},
    create: {
      id: "shop_1",
      shopName: "NUY's Store",
      address: "123 Business Street, Singapore",
      phone: "+65 9123 4567",
      invoicePrefix: "INV",
      footerText: "Thank you for your purchase!",
    },
  });
  console.log("✅ Shop Settings created:", shopSettings.shopName);

  // ============= 2. CREATE CATEGORIES =============
  console.log("\n🏷️  Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Beverages" },
      update: {},
      create: { name: "Beverages" },
    }),
    prisma.category.upsert({
      where: { name: "Groceries" },
      update: {},
      create: { name: "Groceries" },
    }),
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: { name: "Electronics" },
    }),
    prisma.category.upsert({
      where: { name: "Household" },
      update: {},
      create: { name: "Household" },
    }),
  ]);
  console.log("✅ Categories created:", categories.map((c) => c.name).join(", "));

  // ============= 3. CREATE SUPPLIERS =============
  console.log("\n🚚 Creating suppliers...");
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { name: "Global Beverages Inc" },
      update: {},
      create: {
        name: "Global Beverages Inc",
        phone: "+65 6789 0123",
        company: "Global Beverages",
        address: "45 Supply Street, Singapore",
      },
    }),
    prisma.supplier.upsert({
      where: { name: "Fresh Farms Co" },
      update: {},
      create: {
        name: "Fresh Farms Co",
        phone: "+65 6234 5678",
        company: "Fresh Farms",
        address: "78 Farm Road, Singapore",
      },
    }),
    prisma.supplier.upsert({
      where: { name: "Tech World Ltd" },
      update: {},
      create: {
        name: "Tech World Ltd",
        phone: "+65 6456 7890",
        company: "Tech World",
        address: "101 Tech Park, Singapore",
      },
    }),
  ]);
  console.log("✅ Suppliers created:", suppliers.map((s) => s.name).join(", "));

  // ============= 4. CREATE PRODUCTS =============
  console.log("\n📦 Creating products...");
  const products = await Promise.all([
    // Beverages
      prisma.product.upsert({
        where: { id: "product_COLA001" },
        update: {},
        create: {
          id: "product_COLA001",
          name: "Coca Cola 330ml",
          categoryId: categories[0].id,
          buyPrice: 1.2,
          salePrice: 2.5,
          stockQty: 100,
          supplierId: suppliers[0].id,
        },
      }),
      prisma.product.upsert({
        where: { id: "product_SPRITE001" },
        update: {},
        create: {
          id: "product_SPRITE001",
          name: "Sprite 330ml",
          categoryId: categories[0].id,
          buyPrice: 1.2,
          salePrice: 2.5,
          stockQty: 80,
          supplierId: suppliers[0].id,
        },
      }),
    // Groceries
    prisma.product.upsert({
        where: { id: "product_RICE001" },
        update: {},
        create: {
          id: "product_RICE001",
          name: "Jasmine Rice 5kg",
          categoryId: categories[1].id,
          buyPrice: 12.0,
          salePrice: 18.5,
          stockQty: 50,
          supplierId: suppliers[1].id,
        },
      }),
      prisma.product.upsert({
        where: { id: "product_MILK001" },
        update: {},
        create: {
          id: "product_MILK001",
          name: "Fresh Milk 1L",
          categoryId: categories[1].id,
          buyPrice: 3.5,
          salePrice: 5.5,
          stockQty: 120,
          supplierId: suppliers[1].id,
        },
      }),
    // Electronics
    prisma.product.upsert({
        where: { id: "product_USB001" },
        update: {},
        create: {
          id: "product_USB001",
          name: "USB Drive 32GB",
          categoryId: categories[2].id,
          buyPrice: 8.0,
          salePrice: 15.0,
          stockQty: 30,
          supplierId: suppliers[2].id,
        },
      }),
    // Household
    prisma.product.upsert({
        where: { id: "product_SOAP001" },
        update: {},
        create: {
          id: "product_SOAP001",
          name: "Laundry Soap Bar 500g",
          categoryId: categories[3].id,
          buyPrice: 2.0,
          salePrice: 4.0,
          stockQty: 200,
          supplierId: suppliers[1].id,
        },
      }),
  ]);
  console.log(
    "✅ Products created:",
    products.map((p) => p.name).join(", ")
  );

  // ============= 5. CREATE PAYMENT METHODS =============
  console.log("\n💳 Creating payment methods...");
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { name: "Cash" },
      update: {},
      create: { name: "Cash", active: true },
    }),
    prisma.paymentMethod.upsert({
      where: { name: "Credit Card" },
      update: {},
      create: { name: "Credit Card", active: true },
    }),
    prisma.paymentMethod.upsert({
      where: { name: "Debit Card" },
      update: {},
      create: { name: "Debit Card", active: true },
    }),
    prisma.paymentMethod.upsert({
      where: { name: "PayPal" },
      update: {},
      create: { name: "PayPal", active: true },
    }),
  ]);
  console.log(
    "✅ Payment Methods created:",
    paymentMethods.map((p) => p.name).join(", ")
  );

  // ============= 6. CREATE CUSTOMERS =============
  console.log("\n👤 Creating customers...");
  const customers = await Promise.all([
      prisma.customer.upsert({
        where: { phone: "+65 9111 2222" },
        update: {},
        create: {
          name: "John Doe",
          phone: "+65 9111 2222",
          email: "john@example.com",
          address: "123 Home Street",
        },
      }),
      prisma.customer.upsert({
        where: { phone: "+65 9333 4444" },
        update: {},
        create: {
          name: "Jane Smith",
          phone: "+65 9333 4444",
          email: "jane@example.com",
          address: "456 Work Avenue",
        },
      }),
      prisma.customer.upsert({
        where: { phone: "+65 9555 6666" },
        update: {},
        create: {
          name: "Bob Wilson",
          phone: "+65 9555 6666",
          email: "bob@example.com",
          address: "789 Park Lane",
        },
      }),
  ]);
  console.log(
    "✅ Customers created:",
    customers.map((c) => c.name).join(", ")
  );

  // ============= 7. CREATE SAMPLE INVOICES WITH STOCK DEDUCTION =============
  console.log("\n📄 Creating sample invoices with automatic stock deduction...");

  const colaProduct = products.find((product) => product.name === "Coca Cola 330ml");
  const riceProduct = products.find((product) => product.name === "Jasmine Rice 5kg");

  console.log(
    "\n   📊 Stock BEFORE invoice creation:",
    `Coca Cola: ${colaProduct?.stockQty} units, Rice: ${riceProduct?.stockQty} units`
  );

  const existingInvoice = await prisma.invoiceMain.findUnique({
    where: { invoiceNo: "INV-001" },
  });

  if (!existingInvoice) {
    const invoice1 = await prisma.invoiceMain.create({
      data: {
        invoiceNo: "INV-001",
        customerId: customers[0].id,
        subtotal: 8.0,
        discount: 0,
        vatTax: 0.56,
        grandTotal: 8.56,
        paidAmount: 8.56,
        dueAmount: 0,
        paymentMethodId: paymentMethods[0].id,
        notes: "First sample invoice",
        items: {
          create: [
            {
              productId: colaProduct!.id,
              qty: 2,
              unitPrice: 2.5,
              totalPrice: 5.0,
            },
            {
              productId: riceProduct!.id,
              qty: 1,
              unitPrice: 18.5,
              totalPrice: 18.5,
            },
          ],
        },
      },
      include: { items: true, customer: true, paymentMethod: true },
    });

    for (const item of invoice1.items) {
      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          type: "SALE",
          qty: -item.qty,
          referenceInvoiceId: invoice1.id,
          notes: `Sold via ${invoice1.invoiceNo}`,
        },
      });
    }

    await prisma.product.update({
      where: { id: colaProduct!.id },
      data: { stockQty: { decrement: 2 } },
    });

    await prisma.product.update({
      where: { id: riceProduct!.id },
      data: { stockQty: { decrement: 1 } },
    });

    console.log("✅ Invoice created:", invoice1.invoiceNo);
  } else {
    console.log("✅ Sample invoice already exists:", existingInvoice.invoiceNo);
  }

  const colaProductAfter = await prisma.product.findUnique({
    where: { id: colaProduct!.id },
  });

  console.log(
    "   📊 Stock AFTER invoice creation:",
    `Coca Cola: ${colaProductAfter?.stockQty} units`
  );

  // ============= 9. SHOW SUMMARY =============
  console.log("\n" + "=".repeat(60));
  console.log("✨ DATABASE SEED COMPLETE!");
  console.log("=".repeat(60));

  // Get counts
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const customerCount = await prisma.customer.count();
  const supplierCount = await prisma.supplier.count();
  const invoiceCount = await prisma.invoiceMain.count();
  const stockLogCount = await prisma.stockLog.count();

  console.log("\n📊 Database Summary:");
  console.log(`  • Categories: ${categoryCount}`);
  console.log(`  • Suppliers: ${supplierCount}`);
  console.log(`  • Products: ${productCount}`);
  console.log(`  • Customers: ${customerCount}`);
  console.log(`  • Invoices: ${invoiceCount}`);
  console.log(`  • Stock Logs: ${stockLogCount}`);

  console.log("\n🚀 Next Steps:");
  console.log("  1. Run: npm run dev");
  console.log("  2. Check Prisma Studio: npx prisma studio");
  console.log("  4. Explore API endpoints with Postman");

  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

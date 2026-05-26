import { prisma } from "../lib/prisma";

async function main() {
  await prisma.product.create({
    data: {
      name: "Vase design",
      slug: "vase-design",
      description: "Vase 3D imprimé premium",
      price: 49,
      stock: 10,
      image: "/vase.jpg",
    },
  });
}

main()
  .then(() => console.log("Seed done"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
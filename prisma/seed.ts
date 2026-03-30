import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "Announcements",
      slug: "announcements",
      description: "Official news and updates from the staff.",
      icon: "📢",
      color: "#ef4444",
      order: 0,
    },
    {
      name: "General",
      slug: "general",
      description: "General discussion, anything goes.",
      icon: "💬",
      color: "#6366f1",
      order: 1,
    },
    {
      name: "Leaks",
      slug: "leaks",
      description: "Share databases, combos, and leaks.",
      icon: "💧",
      color: "#3b82f6",
      order: 2,
    },
    {
      name: "Tools & Programs",
      slug: "tools",
      description: "Share and discuss tools, configs, and programs.",
      icon: "🔧",
      color: "#f59e0b",
      order: 3,
    },
    {
      name: "Cracking",
      slug: "cracking",
      description: "Cracking configs, tutorials, and results.",
      icon: "⚡",
      color: "#10b981",
      order: 4,
    },
    {
      name: "Marketplace",
      slug: "marketplace",
      description: "Buy, sell, and trade services or accounts.",
      icon: "🛒",
      color: "#8b5cf6",
      order: 5,
    },
    {
      name: "Tutorials",
      slug: "tutorials",
      description: "Guides, how-tos, and educational content.",
      icon: "📚",
      color: "#06b6d4",
      order: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

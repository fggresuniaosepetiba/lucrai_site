"use client";

import { db } from "./dexie";
import { generateId } from "@/lib/utils";

const defaultUsers = [
  {
    name: "Administrador Trinary",
    email: "trinarysolutions.adm",
    password: "TrinarySolutions@@",
    role: "owner" as const,
    company: "Trinary",
  },
  {
    name: "Gabriel Fellype",
    email: "lucrai.adm",
    password: "Lucrai@@",
    role: "admin" as const,
    company: "Lucraí",
  },
  {
    name: "Vitória Justo",
    email: "graonatural.adm",
    password: "GraoNatural@@",
    role: "admin" as const,
    company: "Grão Natura",
  },
];

const defaultCategories = [
  { name: "Vendas", color: "#22c55e", type: "income" as const, icon: "trending-up" },
  { name: "Prestação de Serviços", color: "#0ea5e9", type: "income" as const, icon: "briefcase" },
  { name: "Investimentos", color: "#8b5cf6", type: "income" as const, icon: "bar-chart" },
  { name: "Receitas Diversas", color: "#14b8a6", type: "income" as const, icon: "plus-circle" },
  { name: "Salários", color: "#ef4444", type: "expense" as const, icon: "users" },
  { name: "Aluguel", color: "#f97316", type: "expense" as const, icon: "home" },
  { name: "Fornecedores", color: "#eab308", type: "expense" as const, icon: "truck" },
  { name: "Marketing", color: "#ec4899", type: "expense" as const, icon: "megaphone" },
  { name: "Impostos", color: "#6366f1", type: "expense" as const, icon: "file-text" },
  { name: "Despesas Operacionais", color: "#84cc16", type: "expense" as const, icon: "settings" },
  { name: "Pró-Labore", color: "#06b6d4", type: "expense" as const, icon: "user-check" },
  { name: "Manutenção", color: "#d946ef", type: "expense" as const, icon: "wrench" },
];

export async function seedAll(): Promise<void> {
  const emails = defaultUsers.map((u) => u.email);
  const existing = await db.users.where("email").anyOf(emails).count();
  if (existing < emails.length) {
    await Promise.all([
      db.users.clear(),
      db.categories.clear(),
      db.transactions.clear(),
      db.settings.clear(),
      db.deletedTransactions.clear(),
    ]);
    const now = new Date().toISOString();
    await db.users.bulkAdd(
      defaultUsers.map((u) => ({ ...u, id: generateId(), createdAt: now }))
    );
  }
}

export async function seedDefaultCategories(company: string): Promise<void> {
  const count = await db.categories
    .where("company")
    .equals(company)
    .count();
  if (count > 0) return;

  const now = new Date().toISOString();
  const categories = defaultCategories.map((cat) => ({
    ...cat,
    id: generateId(),
    company,
    createdAt: now,
  }));

  await db.categories.bulkAdd(categories);
}

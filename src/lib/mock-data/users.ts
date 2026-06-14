import type { User } from "./types";

export const seedUsers: User[] = [
  {
    id: "user-1",
    email: "rafa@tallereshernandez.mx",
    fullName: "Rafael Hernández",
    role: "SUPERADMIN",
    createdAt: "2025-11-03T09:00:00.000Z",
  },
  {
    id: "user-2",
    email: "lupita@tallereshernandez.mx",
    fullName: "Guadalupe Ramírez",
    role: "OPERATOR",
    createdAt: "2025-11-10T09:00:00.000Z",
  },
  {
    id: "user-3",
    email: "miguel@tallereshernandez.mx",
    fullName: "Miguel Ángel Torres",
    role: "OPERATOR",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
];

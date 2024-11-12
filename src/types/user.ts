import { z as Zod } from "zod";

export type User = {
  id: number;
  username: string;
  name: string;
  description: string;
  department: number | null;
  role: Role;
};

export type UserPermissions = {
  id: number;
  username: string;
  permissions: Permission[];
  groups: number[];
};

export enum Role {
  teacher = "teacher",
  admin = "admin",
}

export const roleSchema = Zod.union([
  Zod.literal("teacher"),
  Zod.literal("admin"),
]);

export type Group = {
  id: number;
  name: string;
  permissions: Permission[];
};

export enum Permission {
  EditDepartments,
  EditCategories,
  CreatePosts,
  EditPosts,
  ManageUsers,
  ManagePermissions,
  ManagePages,
}

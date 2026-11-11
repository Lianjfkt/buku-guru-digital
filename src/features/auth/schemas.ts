import { z } from "zod";

/**
 * Validasi form login email & password
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format alamat email tidak valid")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validasi form ganti password wajib (Minimal 10 karakter sesuai PRD AUTH-03)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string({ required_error: "Password baru wajib diisi" })
      .min(10, "Password baru minimal terdiri dari 10 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(10, "Konfirmasi password minimal 10 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Validasi pembuatan akun baru oleh admin
 */
export const createUserSchema = z.object({
  email: z.string().email("Format email tidak valid").trim().toLowerCase(),
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  nip: z.string().optional().nullable(),
  role: z.enum(["admin", "guru"]).default("guru"),
  password: z.string().min(10, "Password minimal 10 karakter").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

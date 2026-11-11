import { describe, it, expect } from "vitest";
import { loginSchema, changePasswordSchema, createUserSchema } from "@/features/auth/schemas";

describe("Validasi Skema Autentikasi & Akun", () => {
  describe("loginSchema", () => {
    it("menerima email dan password yang valid", () => {
      const res = loginSchema.safeParse({
        email: "guru@sekolah.sch.id",
        password: "SecretPassword123!",
      });
      expect(res.success).toBe(true);
    });

    it("menolak format email yang salah", () => {
      const res = loginSchema.safeParse({
        email: "bukan-email",
        password: "SecretPassword123!",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toBe("Format alamat email tidak valid");
      }
    });

    it("menolak password kosong", () => {
      const res = loginSchema.safeParse({
        email: "guru@sekolah.sch.id",
        password: "",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("changePasswordSchema (AUTH-03: Minimal 10 karakter)", () => {
    it("menerima password baru >= 10 karakter yang cocok dengan konfirmasi", () => {
      const res = changePasswordSchema.safeParse({
        newPassword: "PasswordAman123!",
        confirmPassword: "PasswordAman123!",
      });
      expect(res.success).toBe(true);
    });

    it("menolak password baru yang kurang dari 10 karakter", () => {
      const res = changePasswordSchema.safeParse({
        newPassword: "pendek",
        confirmPassword: "pendek",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain("minimal terdiri dari 10 karakter");
      }
    });

    it("menolak konfirmasi password yang tidak cocok", () => {
      const res = changePasswordSchema.safeParse({
        newPassword: "PasswordAman123!",
        confirmPassword: "PasswordBeda123!",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toBe("Konfirmasi password baru tidak cocok");
      }
    });
  });

  describe("createUserSchema", () => {
    it("menerima data akun admin/guru yang valid", () => {
      const res = createUserSchema.safeParse({
        email: "guru.baru@sekolah.sch.id",
        full_name: "Budi Santoso, S.Pd.",
        nip: "198801012015011002",
        role: "guru",
      });
      expect(res.success).toBe(true);
    });
  });
});

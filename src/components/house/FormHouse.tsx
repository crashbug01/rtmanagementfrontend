import { useState } from "react";
// 1. IMPORT INSTANCE API DARI UTIL (Sesuaikan dengan path file util.tsx Anda)
import api from "../../util/api.tsx";

import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";

export default function FormRumah() {
  // State untuk form text
  const [formData, setFormData] = useState({
    kode_rumah: "",
  });

  // State untuk loading dan pesan notifikasi
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Handler untuk sinkronisasi input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler submit form rumah
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi manual sederhana di sisi klien
    if (!formData.kode_rumah.trim()) {
      setMessage({
        type: "error",
        text: "Mohon lengkapi data kode rumah.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 2. MENGGUNAKAN API INSTANCE
      // Cukup panggil "/houses", baseURL dan Authorization header otomatis disisipkan oleh util.tsx
      await api.post("/houses", {
        kode_rumah: formData.kode_rumah,
      });

      setMessage({ type: "success", text: "Data rumah berhasil ditambahkan!" });

      // Reset form menjadi kosong kembali setelah sukses
      setFormData({
        kode_rumah: "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComponentCard title="Tambah Data Rumah">
      {/* Pesan Notifikasi Sukses / Gagal */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="kode_rumah">Kode Rumah</Label>
          <Input
            type="text"
            id="kode_rumah"
            name="kode_rumah"
            placeholder="Contoh: A-01, B-12"
            value={formData.kode_rumah}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan Data..." : "Simpan Rumah"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

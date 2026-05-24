import { useState } from "react";
// 1. IMPORT INSTANCE API DARI UTIL (Sesuaikan path folder util.tsx Anda)
import api from "../../util/api.tsx";

import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";

export default function FormPengeluaran() {
  // State untuk form data sesuai fillable model Laravel Expense
  const [formData, setFormData] = useState({
    keterangan: "",
    jumlah: "",
    tanggal_pengeluaran: "",
  });

  // State untuk loading dan pesan notifikasi
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Handler untuk sinkronisasi seluruh input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler submit form pengeluaran
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi manual di sisi klien sebelum menembak API
    if (
      !formData.keterangan.trim() ||
      !formData.jumlah ||
      !formData.tanggal_pengeluaran
    ) {
      setMessage({
        type: "error",
        text: "Mohon lengkapi semua data pengeluaran.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 2. MENGGUNAKAN API INSTANCE
      // Cukup panggil "/expenses", baseURL dan Authorization header otomatis disisipkan
      await api.post("/expenses", {
        keterangan: formData.keterangan,
        jumlah: Number(formData.jumlah), // Konversi string ke numeric sesuai validasi Laravel
        tanggal_pengeluaran: formData.tanggal_pengeluaran,
      });

      setMessage({
        type: "success",
        text: "Data pengeluaran berhasil ditambahkan!",
      });

      // Reset form menjadi kosong kembali setelah sukses
      setFormData({
        keterangan: "",
        jumlah: "",
        tanggal_pengeluaran: "",
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
    <ComponentCard title="Tambah Data Pengeluaran">
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
        {/* Input 1: Keterangan */}
        <div>
          <Label htmlFor="keterangan">Keterangan Pengeluaran</Label>
          <Input
            type="text"
            id="keterangan"
            name="keterangan"
            placeholder="Contoh: Perbaikan lampu jalan RT, Pembelian sapu"
            value={formData.keterangan}
            onChange={handleChange}
          />
        </div>

        {/* Input 2: Jumlah Uang */}
        <div>
          <Label htmlFor="jumlah">Jumlah Anggaran (Rp)</Label>
          <Input
            type="number"
            id="jumlah"
            name="jumlah"
            placeholder="Contoh: 150000"
            value={formData.jumlah}
            onChange={handleChange}
          />
        </div>

        {/* Input 3: Tanggal Pengeluaran */}
        <div>
          <Label htmlFor="tanggal_pengeluaran">Tanggal Pengeluaran</Label>
          <Input
            type="date"
            id="tanggal_pengeluaran"
            name="tanggal_pengeluaran"
            value={formData.tanggal_pengeluaran}
            onChange={handleChange}
          />
        </div>

        {/* Tombol Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan Data..." : "Simpan Pengeluaran"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

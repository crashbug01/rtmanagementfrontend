import { useState } from "react";
// 1. IMPORT INSTANCE API DARI UTIL (Sesuaikan path folder util.tsx Anda)
import api from "../../util/api.tsx";

import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Select from "../form/Select.tsx";
import Button from "../ui/button/Button.tsx";

export default function FormWarga() {
  // State untuk form text/select
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    status_penghuni: "tetap",
    nomor_telepon: "",
    sudah_menikah: "0",
  });

  // State khusus untuk file
  const [fotoKtp, setFotoKtp] = useState<File | null>(null);

  // State untuk loading dan pesan
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const statusOptions = [
    { value: "tetap", label: "Penghuni Tetap" },
    { value: "kontrak", label: "Penghuni Kontrak" },
  ];

  const menikahOptions = [
    { value: "0", label: "Belum Menikah" },
    { value: "1", label: "Sudah Menikah" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoKtp(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    if (!formData.nama_lengkap || !formData.nomor_telepon || !fotoKtp) {
      setMessage({
        type: "error",
        text: "Mohon lengkapi data dan upload foto KTP.",
      });
      setIsLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append("nama_lengkap", formData.nama_lengkap);
    payload.append("status_penghuni", formData.status_penghuni);
    payload.append("nomor_telepon", formData.nomor_telepon);
    payload.append("sudah_menikah", formData.sudah_menikah);
    payload.append("foto_ktp", fotoKtp);

    try {
      // 2. MENGGUNAKAN API INSTANCE
      // URL disederhanakan dan token Authorization otomatis dimasukkan oleh interceptor.
      // Kita hanya perlu menegaskan content-type multipart/form-data untuk upload berkas.
      await api.post("/residents", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Data warga berhasil ditambahkan!" });

      // Reset form
      setFormData({
        nama_lengkap: "",
        status_penghuni: "tetap",
        nomor_telepon: "",
        sudah_menikah: "0",
      });
      setFotoKtp(null);
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
    <ComponentCard title="Tambah Data Warga">
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
          <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
          <Input
            type="text"
            id="nama_lengkap"
            name="nama_lengkap"
            placeholder="Masukkan nama lengkap"
            value={formData.nama_lengkap}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
          <Input
            type="text"
            id="nomor_telepon"
            name="nomor_telepon"
            placeholder="081234567890"
            value={formData.nomor_telepon}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Status Penghuni</Label>
          <Select
            options={statusOptions}
            placeholder="Pilih status"
            onChange={(val: string) =>
              setFormData({ ...formData, status_penghuni: val })
            }
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label>Status Pernikahan</Label>
          <Select
            options={menikahOptions}
            placeholder="Pilih status"
            onChange={(val: string) =>
              setFormData({ ...formData, sudah_menikah: val })
            }
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label htmlFor="foto_ktp">Foto KTP (Maks 2MB, JPG/PNG)</Label>
          <Input
            type="file"
            id="foto_ktp"
            name="foto_ktp"
            onChange={handleFileChange}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan Data..." : "Simpan Warga"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

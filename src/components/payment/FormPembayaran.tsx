import { useState, useEffect } from "react";
// 1. IMPORT INSTANCE API DARI UTIL (Sesuaikan path file util Anda)
import api from "../../util/api";

import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Button from "../ui/button/Button";

export default function FormPembayaran() {
  // State untuk data API relasi (Dropdown Rumah & Warga)
  const [houses, setHouses] = useState<{ value: string; label: string }[]>([]);
  const [residents, setResidents] = useState<
    { value: string; label: string }[]
  >([]);

  // State untuk form data
  const [formData, setFormData] = useState({
    house_id: "",
    resident_id: "",
    jenis_iuran: "kebersihan",
    jumlah: "",
    tahun: new Date().getFullYear().toString(),
    tipe_pembayaran: "bulanan",
    bulan: "",
    tanggal_bayar: new Date().toISOString().split("T")[0],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const jenisIuranOptions = [
    { value: "kebersihan", label: "Iuran Kebersihan" },
    { value: "satpam", label: "Iuran Satpam/Keamanan" },
  ];

  const tipePembayaranOptions = [
    { value: "bulanan", label: "Bulanan (1 Bulan)" },
    { value: "tahunan", label: "Tahunan (Bayar 12 Bulan Full)" },
  ];

  const bulanOptions = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // Mengambil data Rumah dan Warga untuk opsi dropdown
  useEffect(() => {
    const fetchRelations = async () => {
      try {
        // 2. MENGGUNAKAN API INSTANCE (Tanpa full URL & tanpa config token manual)
        const resHouses = await api.get("/houses");
        const dataH = Array.isArray(resHouses.data)
          ? resHouses.data
          : resHouses.data.data;
        setHouses(
          dataH.map((h: any) => ({
            value: h.id.toString(),
            label: `Rumah: ${h.kode_rumah}`,
          })),
        );

        // Fetch Residents menggunakan api instance
        const resResidents = await api.get("/residents");
        const dataR = Array.isArray(resResidents.data)
          ? resResidents.data
          : resResidents.data.data;
        setResidents(
          dataR.map((r: any) => ({
            value: r.id.toString(),
            label: r.nama_lengkap,
          })),
        );
      } catch (error) {
        console.error("Gagal memuat data relasi dropdown:", error);
      }
    };
    fetchRelations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    if (!formData.house_id || !formData.resident_id || !formData.jumlah) {
      setMessage({
        type: "error",
        text: "Lengkapi data Rumah, Warga, dan Jumlah pembayaran.",
      });
      setIsLoading(false);
      return;
    }

    if (formData.tipe_pembayaran === "bulanan" && !formData.bulan) {
      setMessage({
        type: "error",
        text: "Pembayaran bulanan wajib memilih Bulan.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        house_id: Number(formData.house_id),
        resident_id: Number(formData.resident_id),
        jenis_iuran: formData.jenis_iuran,
        jumlah: Number(formData.jumlah),
        tahun: Number(formData.tahun),
        tipe_pembayaran: formData.tipe_pembayaran,
        tanggal_bayar: formData.tanggal_bayar,
      };

      if (formData.tipe_pembayaran === "bulanan") {
        payload.bulan = Number(formData.bulan);
      }

      // 3. POST REQUEST MENGGUNAKAN API INSTANCE (Bersih dari config token manual)
      const response = await api.post("/payments", payload);

      setMessage({
        type: "success",
        text: response.data.message || "Pembayaran berhasil dicatat!",
      });

      setFormData((prev) => ({
        ...prev,
        jumlah: "",
        bulan: "",
      }));
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
    <ComponentCard title="Input Pembayaran Iuran">
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Rumah</Label>
            <Select
              options={houses}
              placeholder="Pilih Rumah..."
              onChange={(val: string) =>
                setFormData({ ...formData, house_id: val })
              }
              className="dark:bg-dark-900"
            />
          </div>
          <div>
            <Label>Warga (Pembayar)</Label>
            <Select
              options={residents}
              placeholder="Pihl Warga..."
              onChange={(val: string) =>
                setFormData({ ...formData, resident_id: val })
              }
              className="dark:bg-dark-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Jenis Iuran</Label>
            <Select
              options={jenisIuranOptions}
              placeholder="Pilih Jenis Iuran"
              onChange={(val: string) =>
                setFormData({ ...formData, jenis_iuran: val })
              }
              className="dark:bg-dark-900"
            />
          </div>
          <div>
            <Label htmlFor="jumlah">Jumlah (Rp)</Label>
            <Input
              type="number"
              id="jumlah"
              name="jumlah"
              placeholder="Contoh: 50000"
              value={formData.jumlah}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Tipe Pembayaran</Label>
            <Select
              options={tipePembayaranOptions}
              placeholder="Pilih Tipe"
              onChange={(val: string) =>
                setFormData({ ...formData, tipe_pembayaran: val })
              }
              className="dark:bg-dark-900"
            />
          </div>
          <div>
            <Label htmlFor="tahun">Tahun</Label>
            <Input
              type="number"
              id="tahun"
              name="tahun"
              placeholder="Contoh: 2026"
              value={formData.tahun}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {formData.tipe_pembayaran === "bulanan" ? (
            <div>
              <Label>Bulan</Label>
              <Select
                options={bulanOptions}
                placeholder="Pilih Bulan..."
                onChange={(val: string) =>
                  setFormData({ ...formData, bulan: val })
                }
                className="dark:bg-dark-900"
              />
            </div>
          ) : (
            <div className="flex items-center p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <span className="font-medium">Pembayaran 1 Tahun Penuh.</span>
              &nbsp;Sistem akan otomatis mencatat 12 bulan lunas.
            </div>
          )}
          <div>
            <Label htmlFor="tanggal_bayar">Tanggal Pembayaran</Label>
            <Input
              type="date"
              id="tanggal_bayar"
              name="tanggal_bayar"
              value={formData.tanggal_bayar}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan Data..." : "Simpan Pembayaran"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

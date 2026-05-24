import { useState, useEffect } from "react";
import api from "../../util/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export interface Expense {
  id: number;
  keterangan: string;
  jumlah: number;
  tanggal_pengeluaran: string;
}

export default function TabelPengeluaran() {
  const [dataPengeluaran, setDataPengeluaran] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk kontrol Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [currentEditData, setCurrentEditData] = useState<Expense | null>(null);

  // Mengambil Data dari API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/expenses");
      const expensesData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setDataPengeluaran(expensesData);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Gagal mengambil data pengeluaran:", err);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat memuat data dari server.",
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === FUNGSI DELETE (HAPUS DATA) ===
  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus data pengeluaran ini?")
    ) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      // Filter state lokal agar baris tabel langsung hilang tanpa reload halaman
      setDataPengeluaran((prev) => prev.filter((item) => item.id !== id));
      alert("Data berhasil dihapus!");
    } catch (err: any) {
      console.error("Gagal menghapus data:", err);
      alert(err.response?.data?.message || "Gagal menghapus data dari server.");
    }
  };

  // === FUNGSI BUKA MODAL EDIT ===
  const openEditModal = (expense: Expense) => {
    setCurrentEditData(expense);
    setIsEditModalOpen(true);
  };

  // === FUNGSI SUBMIT UPDATE ===
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditData) return;

    // VALIDASI MANUAL (Menggantikan peran atribut HTML 'required' yang error di TS)
    if (
      !currentEditData.keterangan.trim() ||
      !currentEditData.jumlah ||
      !currentEditData.tanggal_pengeluaran
    ) {
      alert("Mohon lengkapi semua kolom form edit.");
      return;
    }

    try {
      setIsSavingEdit(true);
      const response = await api.put(`/expenses/${currentEditData.id}`, {
        keterangan: currentEditData.keterangan,
        jumlah: Number(currentEditData.jumlah),
        tanggal_pengeluaran: currentEditData.tanggal_pengeluaran,
      });

      const updatedExpense = response.data.data || response.data;

      // Sinkronisasi data yang baru saja diedit ke dalam state tabel
      setDataPengeluaran((prev) =>
        prev.map((item) =>
          item.id === currentEditData.id ? updatedExpense : item,
        ),
      );

      setIsEditModalOpen(false);
      setCurrentEditData(null);
      alert("Data berhasil diperbarui!");
    } catch (err: any) {
      console.error("Gagal memperbarui data:", err);
      alert(err.response?.data?.message || "Gagal memperbarui data.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // === FUNGSI FORMATTER ===
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggal = (tanggal: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(tanggal));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05]">
        <span className="text-gray-500 dark:text-gray-400 animate-pulse">
          Memuat data pengeluaran...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/10 dark:border-red-900/50">
        <span className="text-red-500 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tanggal Pengeluaran
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Keterangan
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Jumlah (Rp)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {dataPengeluaran.length === 0 ? (
              <TableRow>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-theme-sm"
                >
                  Belum ada data pengeluaran.
                </td>
              </TableRow>
            ) : (
              dataPengeluaran.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatTanggal(expense.tanggal_pengeluaran)}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    <span className="block text-gray-600 text-theme-sm dark:text-gray-400">
                      {expense.keterangan}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-end">
                    <span className="block font-semibold text-red-600 text-theme-sm dark:text-red-400">
                      {formatRupiah(expense.jumlah)}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* === MODAL POPUP EDIT DATA === */}
      {isEditModalOpen && currentEditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800 animate-fade-in">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Edit Data Pengeluaran
            </h3>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_keterangan">Keterangan</Label>
                <Input
                  type="text"
                  id="edit_keterangan"
                  value={currentEditData.keterangan}
                  onChange={(e) =>
                    setCurrentEditData({
                      ...currentEditData,
                      keterangan: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit_jumlah">Jumlah Anggaran (Rp)</Label>
                <Input
                  type="number"
                  id="edit_jumlah"
                  value={currentEditData.jumlah.toString()}
                  onChange={(e) =>
                    setCurrentEditData({
                      ...currentEditData,
                      jumlah: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit_tanggal">Tanggal Pengeluaran</Label>
                <Input
                  type="date"
                  id="edit_tanggal"
                  value={currentEditData.tanggal_pengeluaran}
                  onChange={(e) =>
                    setCurrentEditData({
                      ...currentEditData,
                      tanggal_pengeluaran: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentEditData(null);
                  }}
                  disabled={isSavingEdit}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Mencegah modal tertutup oleh Header Utama
import api from "../../util/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button"; // Pastikan path Button kustom ini sesuai

// ==========================================
// 1. DEFINISI INTERFACE / DATA TYPE (TS)
// ==========================================
export interface House {
  id: number;
  kode_rumah: string;
}

export interface Resident {
  id: number;
  nama_lengkap: string;
}

export interface Payment {
  id: number;
  house_id: number;
  resident_id: number;
  jenis_iuran: "kebersihan" | "satpam";
  bulan: string;
  tahun: number;
  jumlah: number;
  status: "lunas" | "belum";
  tanggal_bayar: string | null;
  house?: House;
  resident?: Resident;
}

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================
export default function TabelPembayaran() {
  // State Utama Data Tabel Pembayaran
  const [dataPembayaran, setDataPembayaran] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Fitur Edit Jumlah
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [inputJumlah, setInputJumlah] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fungsi fetch data pembayaran dari API
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get("/payments", { headers });

      const paymentsData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setDataPembayaran(paymentsData);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Gagal mengambil data pembayaran:", err);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat memuat data pembayaran dari server.",
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Membuka modal edit dan memetakan nilai lama ke form input
  const handleOpenEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setInputJumlah(payment.jumlah.toString());
    setIsEditOpen(true);
  };

  // Fungsi submit perubahan ke fungsi update() Laravel Controller
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !inputJumlah) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Mengirim data jumlah baru ke endpoint: PUT /api/payments/{id}
      await api.put(
        `/payments/${selectedPayment.id}`,
        {
          jumlah: Number(inputJumlah),
          tanggal_bayar: selectedPayment.tanggal_bayar, // Mempertahankan tanggal bayar lama
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      alert("Jumlah pembayaran iuran warga berhasil diperbarui!");
      setIsEditOpen(false);
      setSelectedPayment(null);

      // Memuat ulang data tabel agar perubahan nominal & status otomatis tersinkronisasi
      fetchPayments();
    } catch (err: any) {
      console.error("Gagal mengupdate jumlah pembayaran:", err);
      alert(
        err.response?.data?.message || "Gagal memperbarui jumlah pembayaran.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // === FUNGSI FORMATTER KEUANGAN & TANGGAL ===
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggal = (tanggalString: string | null) => {
    if (!tanggalString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(tanggalString));
  };

  const formatBulan = (bulanStr: string) => {
    const namaBulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const index = parseInt(bulanStr, 10);
    return !isNaN(index) && index >= 1 && index <= 12
      ? namaBulan[index - 1]
      : bulanStr;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05]">
        <span className="text-gray-500 dark:text-gray-400 animate-pulse">
          Memuat data pembayaran iuran...
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
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* HEADER TABEL */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Kode Rumah
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nama Pembayar
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Jenis Iuran
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Periode (Bulan/Tahun)
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
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tanggal Bayar
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Aksi
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* BODY / ISI TABEL */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {dataPembayaran.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-theme-sm"
                  >
                    Belum ada rekaman riwayat pembayaran iuran warga.
                  </td>
                </TableRow>
              ) : (
                dataPembayaran.map((payment) => (
                  <TableRow key={payment.id}>
                    {/* Kolom 1: Kode Rumah */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {payment.house?.kode_rumah || (
                          <span className="text-gray-400 italic font-normal">
                            N/A
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Kolom 2: Nama Warga */}
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {payment.resident?.nama_lengkap || (
                          <span className="text-gray-400 italic font-normal">
                            Tidak Terikat Warga
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Kolom 3: Jenis Iuran */}
                    <TableCell className="px-5 py-4 text-start">
                      <span className="capitalize block text-gray-600 text-theme-sm dark:text-gray-400">
                        {payment.jenis_iuran === "satpam"
                          ? "Satpam/Keamanan"
                          : payment.jenis_iuran}
                      </span>
                    </TableCell>

                    {/* Kolom 4: Periode */}
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-theme-sm dark:text-gray-400">
                      <span>{formatBulan(payment.bulan)}</span> /{" "}
                      {payment.tahun}
                    </TableCell>

                    {/* Kolom 5: Jumlah Keuangan */}
                    <TableCell className="px-5 py-4 text-end">
                      <span className="block font-semibold text-green-600 text-theme-sm dark:text-green-400">
                        {formatRupiah(payment.jumlah)}
                      </span>
                    </TableCell>

                    {/* Kolom 6: Badge Status Kelunasan */}
                    <TableCell className="px-5 py-4 text-center">
                      <Badge
                        size="sm"
                        color={payment.status === "lunas" ? "success" : "error"}
                      >
                        {payment.status === "lunas" ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>

                    {/* Kolom 7: Tanggal Dilakukannya Pembayaran */}
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatTanggal(payment.tanggal_bayar)}
                    </TableCell>

                    {/* Kolom Baru 8: Tombol Tindakan Edit */}
                    <TableCell className="px-5 py-4 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(payment)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL EDIT JUMLAH: Menggunakan Portal langsung ke elemen <body> global */}
      {/* ========================================================================= */}
      {isEditOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
              {/* Header Modal */}
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit Jumlah Pembayaran
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold focus:outline-none"
                >
                  &times;
                </button>
              </div>

              {/* Form Konten Input Perubahan Angka */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p>
                    <strong>Pembayar:</strong>{" "}
                    {selectedPayment?.resident?.nama_lengkap}
                  </p>
                  <p>
                    <strong>Rumah:</strong> {selectedPayment?.house?.kode_rumah}
                  </p>
                  <p>
                    <strong>Iuran:</strong>{" "}
                    <span className="capitalize">
                      {selectedPayment?.jenis_iuran}
                    </span>{" "}
                    ({formatBulan(selectedPayment?.bulan ?? "")}{" "}
                    {selectedPayment?.tahun})
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="modal_jumlah"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1"
                  >
                    Jumlah Nominal Baru (Rp)
                  </label>
                  <input
                    type="number"
                    id="modal_jumlah"
                    value={inputJumlah}
                    onChange={(e) => setInputJumlah(e.target.value)}
                    placeholder="Masukkan nominal iuran baru..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                    min="0"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                    *Ketentuan kelunasan: Satpam min. Rp100.000 / Kebersihan
                    min. Rp15.000.
                  </p>
                </div>

                {/* Tombol Navigasi Modal */}
                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedPayment(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Memproses..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

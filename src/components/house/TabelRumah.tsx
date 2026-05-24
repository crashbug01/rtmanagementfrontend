import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Diperlukan untuk melepas modal dari jeratan CSS layout parent
import api from "../../util/api"; // Sesuaikan path jika berbeda

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button"; // Menggunakan komponen Button kustom yang sudah diperbaiki properti 'type'-nya

// ==========================================
// 1. PENENTUAN INTERFACE / DATA TYPE (TS)
// ==========================================
export interface Resident {
  id: number;
  nama_lengkap: string;
  status_penghuni: "kontrak" | "tetap";
  nomor_telepon: string;
}

export interface HouseHistory {
  id: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string | null;
  resident?: Resident;
}

export interface House {
  id: number;
  kode_rumah: string;
  status: "dihuni" | "tidak dihuni";
  current_resident?: HouseHistory | null;
  currentResident?: HouseHistory | null; // Fallback untuk fleksibilitas camelCase/snake_case
  histories?: HouseHistory[];
}

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================
export default function TabelRumah() {
  // State Utama Data Tabel
  const [dataRumah, setDataRumah] = useState<House[]>([]);
  const [daftarWarga, setDaftarWarga] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal Edit Nama/Kode Rumah
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newKodeRumah, setNewKodeRumah] = useState("");

  // State Modal Assign Warga
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Riwayat (History)
  const [houseDetail, setHouseDetail] = useState<House | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fungsi untuk mengambil data utama (Rumah & Dropdown Warga)
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Ambil data daftar rumah
      const responseRumah = await api.get("/houses", { headers });
      const housesData = Array.isArray(responseRumah.data)
        ? responseRumah.data
        : responseRumah.data.data || [];
      setDataRumah(housesData);

      // Ambil data warga untuk kebutuhan opsi dropdown di dalam modal assign
      const responseWarga = await api.get("/residents", { headers });
      const residentsData = Array.isArray(responseWarga.data)
        ? responseWarga.data
        : responseWarga.data.data || [];
      setDaftarWarga(residentsData);

      setIsLoading(false);
    } catch (err: any) {
      console.error("Gagal mengambil data:", err);
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

  // Fungsi membuka Modal Riwayat (Memanggil fungsi 'show' pada Controller)
  const handleOpenHistory = async (id: number) => {
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/houses/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setHouseDetail(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memuat riwayat rumah.");
      setIsHistoryOpen(false);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fungsi submit Update Nama/Kode Rumah (Memanggil fungsi 'update' pada Controller)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || !newKodeRumah.trim()) {
      alert("Kode rumah tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/houses/${selectedHouse.id}`,
        { kode_rumah: newKodeRumah },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      alert("Kode rumah berhasil diperbarui!");
      setIsEditOpen(false);
      fetchData(); // Muat ulang data tabel
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Gagal memperbarui kode rumah. Pastikan kode unik.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi submit Assign Warga Baru (Memanggil fungsi 'assignResident' pada Controller)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || !selectedResidentId || !tanggalMulai) {
      alert("Mohon lengkapi semua data form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/houses/${selectedHouse.id}/assign`,
        {
          resident_id: selectedResidentId,
          tanggal_mulai: tanggalMulai,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      alert("Penghuni baru berhasil ditetapkan ke rumah!");
      setIsAssignOpen(false);

      // Reset Form State
      setSelectedResidentId("");
      setTanggalMulai("");

      // Refresh data tabel agar status langsung berubah otomatis tanpa reload page
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menetapkan penghuni baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmptyHouse = async (id: number) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengosongkan rumah ini? Status penghuni akan diakhiri hari ini.",
      )
    ) {
      return;
    }

    setIsEmptying(id);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/houses/${id}/empty`,
        {},
        {
          // Sesuaikan endpoint dengan controller Anda
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      alert("Rumah berhasil dikosongkan.");
      fetchData(); // Refresh data tabel
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengosongkan rumah.");
    } finally {
      setIsEmptying(null);
    }
  };

  const [isEmptying, setIsEmptying] = useState<number | null>(null); // Menyimpan ID rumah yang sedang diproses

  // State Tampilan: Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05]">
        <span className="text-gray-500 dark:text-gray-400 animate-pulse">
          Memuat data tabel rumah...
        </span>
      </div>
    );
  }

  // State Tampilan: Error
  if (error) {
    return (
      <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/10 dark:border-red-900/50">
        <span className="text-red-500 font-medium">{error}</span>
      </div>
    );
  }

  // Tampilan Struktur Utama Render
  return (
    <>
      {/* KONTEN UTAMA: STRUKTUR TABEL */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
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
                  Status Rumah
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Penghuni Saat Ini
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status Warga
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  No. Telepon
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
              {dataRumah.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-theme-sm"
                  >
                    Belum ada data rumah terdaftar.
                  </td>
                </TableRow>
              ) : (
                dataRumah.map((house) => {
                  const currentHistory =
                    house.current_resident ?? house.currentResident;
                  const activeResident = currentHistory?.resident;

                  return (
                    <TableRow key={house.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                          {house.kode_rumah}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={
                            house.status === "dihuni" ? "success" : "error"
                          }
                        >
                          {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        {activeResident ? (
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {activeResident.nama_lengkap}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-theme-sm dark:text-gray-500">
                            Tidak ada penghuni
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        {activeResident ? (
                          <Badge
                            size="sm"
                            color={
                              activeResident.status_penghuni === "tetap"
                                ? "success"
                                : "warning"
                            }
                          >
                            {activeResident.status_penghuni === "tetap"
                              ? "Warga Tetap"
                              : "Kontrak"}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            -
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {activeResident ? activeResident.nomor_telepon : "-"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenHistory(house.id)}
                          >
                            Riwayat
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white border-none"
                            onClick={() => {
                              setSelectedHouse(house);
                              setNewKodeRumah(house.kode_rumah);
                              setIsEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedHouse(house);
                              setIsAssignOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                          {house.status === "dihuni" && (
                            <Button
                              type="button"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white border-none"
                              onClick={() => handleEmptyHouse(house.id)}
                              disabled={isEmptying === house.id}
                            >
                              {isEmptying === house.id ? "..." : "Kosongkan"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL SECTION: Dirender menggunakan Portal langsung ke elemen <body> global */}
      {/* ========================================================================= */}

      {/* MODAL 1: LIHAT RIWAYAT PENGHUNI (SHOW) */}
      {isHistoryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Riwayat Penghuni Rumah {houseDetail?.kode_rumah}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setHouseDetail(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold focus:outline-none"
                >
                  &times;
                </button>
              </div>

              {isLoadingHistory ? (
                <p className="text-center py-6 text-gray-500 animate-pulse">
                  Memuat histori dari server...
                </p>
              ) : houseDetail?.histories && houseDetail.histories.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                  {houseDetail.histories.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 border rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {hist.resident?.nama_lengkap ||
                            "Warga Tidak Diketahui"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status:{" "}
                          {hist.resident?.status_penghuni === "tetap"
                            ? "Warga Tetap"
                            : "Kontrak"}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>
                          <span className="font-medium text-gray-700 dark:text-gray-400">
                            Mulai:
                          </span>{" "}
                          {hist.tanggal_mulai || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700 dark:text-gray-400">
                            Selesai:
                          </span>{" "}
                          {hist.tanggal_selesai ? (
                            hist.tanggal_selesai
                          ) : (
                            <span className="text-green-600 font-medium dark:text-green-400">
                              Aktif Menghuni
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-400 italic">
                  Belum ada riwayat penghuni untuk rumah ini.
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setHouseDetail(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL 2: EDIT NAMA/KODE RUMAH (UPDATE) */}
      {isEditOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ubah Identitas Rumah
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Kode/Nomor Rumah Baru
                  </label>
                  <input
                    type="text"
                    value={newKodeRumah}
                    onChange={(e) => setNewKodeRumah(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-semibold"
                    placeholder="Contoh: Blok A-12"
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white border-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL 3: ASSIGN PENGHUNI BARU (ASSIGN) */}
      {isAssignOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Assign Rumah {selectedHouse?.kode_rumah}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                {selectedHouse?.status === "dihuni" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400">
                    ⚠️ Rumah ini sedang dihuni. Menetapkan penghuni baru akan
                    otomatis mengisi <strong>tanggal selesai</strong> pada
                    penghuni saat ini.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Pilih Warga
                  </label>
                  <select
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="">-- Pilih Calon Penghuni --</option>
                    {daftarWarga.map((warga) => (
                      <option key={warga.id} value={warga.id}>
                        {warga.nama_lengkap} (
                        {warga.status_penghuni === "tetap"
                          ? "Tetap"
                          : "Kontrak"}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Tanggal Mulai Menghuni
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssignOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Memproses..." : "Simpan Penghuni"}
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

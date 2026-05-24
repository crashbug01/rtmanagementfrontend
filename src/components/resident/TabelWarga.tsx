import { useState, useEffect } from "react";
// Pastikan path ini sesuai dengan lokasi file api.ts yang Anda buat
import api from "../../util/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";

// Import komponen form (Sesuaikan path-nya dengan struktur folder Anda)
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";

// 1. Interface / Struktur Data Warga
export interface Resident {
  id: number;
  nama_lengkap: string;
  foto_ktp: string | null;
  status_penghuni: "kontrak" | "tetap";
  nomor_telepon: string;
  sudah_menikah: boolean;
}

export default function TabelWarga() {
  // 2. Definisi State Tabel
  const [dataWarga, setDataWarga] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // === STATE UNTUK FITUR EDIT ===
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama_lengkap: "",
    status_penghuni: "tetap",
    nomor_telepon: "",
    sudah_menikah: "0",
  });
  const [editFotoKtp, setEditFotoKtp] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const statusOptions = [
    { value: "tetap", label: "Penghuni Tetap" },
    { value: "kontrak", label: "Penghuni Kontrak" },
  ];

  const menikahOptions = [
    { value: "0", label: "Belum Menikah" },
    { value: "1", label: "Sudah Menikah" },
  ];

  // 3. Fetch Data API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/residents");
      setDataWarga(response.data.data || response.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Gagal mengambil data warga:", err);
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

  // === FUNGSI DOWNLOAD KTP ===
  const handleDownload = (fileUrl: string, residentName: string) => {
    const finalUrl = fileUrl;
    const link = document.createElement("a");
    link.href = finalUrl;

    const formattedName = residentName.replace(/\s+/g, "_").toLowerCase();
    const extension = fileUrl.split(".").pop()?.split(/[#?]/)[0] || "jpg";

    link.setAttribute("download", `KTP_${formattedName}.${extension}`);
    link.setAttribute("target", "_blank");
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // === HANDLER FITUR EDIT ===
  const handleEditClick = (resident: Resident) => {
    // Set data form dengan data resident yang dipilih
    setEditFormData({
      nama_lengkap: resident.nama_lengkap,
      status_penghuni: resident.status_penghuni,
      nomor_telepon: resident.nomor_telepon,
      sudah_menikah: resident.sudah_menikah ? "1" : "0", // Convert boolean ke string
    });
    setEditFotoKtp(null); // Reset file input
    setUpdateMessage({ type: "", text: "" });
    setEditingResident(resident);
  };

  const handleCancelEdit = () => {
    setEditingResident(null);
    setEditFotoKtp(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditFotoKtp(e.target.files[0]);
    }
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    setIsUpdating(true);
    setUpdateMessage({ type: "", text: "" });

    // Gunakan FormData karena kita mengirimkan File
    const payload = new FormData();

    // TRICK LARAVEL: Method spoofing untuk mengirim file via PUT
    payload.append("_method", "PUT");
    payload.append("nama_lengkap", editFormData.nama_lengkap);
    payload.append("status_penghuni", editFormData.status_penghuni);
    payload.append("nomor_telepon", editFormData.nomor_telepon);
    payload.append("sudah_menikah", editFormData.sudah_menikah);

    // Append foto KTP HANYA JIKA user memilih file baru
    if (editFotoKtp) {
      payload.append("foto_ktp", editFotoKtp);
    }

    try {
      // POST request ke endpoint update resident
      await api.post(`/residents/${editingResident.id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUpdateMessage({ type: "success", text: "Data berhasil diperbarui!" });

      // Refresh tabel data dan kembali ke tampilan tabel setelah 1 detik
      fetchData();
      setTimeout(() => {
        setEditingResident(null);
      }, 1000);
    } catch (error: any) {
      setUpdateMessage({
        type: "error",
        text: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Tampilan saat Loading & Error
  if (isLoading && !editingResident) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05]">
        <span className="text-gray-500 dark:text-gray-400">
          Memuat data warga...
        </span>
      </div>
    );
  }

  if (error && !editingResident) {
    return (
      <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/10 dark:border-red-900/50">
        <span className="text-red-500 font-medium">{error}</span>
      </div>
    );
  }

  // 5. Tampilan Form Edit (Akan merender ini jika ada baris yang sedang diedit)
  if (editingResident) {
    return (
      <ComponentCard title={`Edit Data Warga: ${editingResident.nama_lengkap}`}>
        {updateMessage.text && (
          <div
            className={`p-4 mb-6 rounded-lg text-sm ${
              updateMessage.type === "success"
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {updateMessage.text}
          </div>
        )}

        <form onSubmit={submitUpdate} className="space-y-6">
          <div>
            <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
            <Input
              type="text"
              id="nama_lengkap"
              name="nama_lengkap"
              value={editFormData.nama_lengkap}
              onChange={handleEditChange}
            />
          </div>

          <div>
            <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
            <Input
              type="text"
              id="nomor_telepon"
              name="nomor_telepon"
              value={editFormData.nomor_telepon}
              onChange={handleEditChange}
            />
          </div>

          <div>
            <Label>Status Penghuni</Label>
            <Select
              options={statusOptions}
              placeholder="Pilih status"
              onChange={(val: string) =>
                setEditFormData({ ...editFormData, status_penghuni: val })
              }
              className="dark:bg-dark-900"
            />
            {/* Note: Jika Select komponen Anda tidak mendukung initial value/default value langsung dari props, Anda mungkin perlu menyesuaikan komponen Select Anda agar bisa menampilkan nilai yang sudah ada di editFormData.status_penghuni */}
          </div>

          <div>
            <Label>Status Pernikahan</Label>
            <Select
              options={menikahOptions}
              placeholder="Pilih status"
              onChange={(val: string) =>
                setEditFormData({ ...editFormData, sudah_menikah: val })
              }
              className="dark:bg-dark-900"
            />
          </div>

          <div>
            <Label htmlFor="foto_ktp">
              Foto KTP (Kosongkan jika tidak ingin mengubah foto)
            </Label>
            <Input
              type="file"
              id="foto_ktp"
              name="foto_ktp"
              onChange={handleEditFileChange}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              disabled={isUpdating}
              type="submit"
            >
              {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            <Button
              className="w-full sm:w-auto bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
              size="sm"
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Batal
            </Button>
          </div>
        </form>
      </ComponentCard>
    );
  }

  // 6. Tampilan Utama (Tabel)
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
                Nama Warga
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Foto KTP
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status Penghuni
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                No. Telepon
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status Pernikahan
              </TableCell>
              {/* Kolom Aksi Baru */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {dataWarga.length === 0 ? (
              <TableRow>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-theme-sm"
                >
                  Belum ada data warga terdaftar.
                </td>
              </TableRow>
            ) : (
              dataWarga.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {resident.nama_lengkap}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    {resident.foto_ktp ? (
                      <button
                        onClick={() =>
                          handleDownload(
                            resident.foto_ktp as string,
                            resident.nama_lengkap,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        Tidak ada KTP
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        resident.status_penghuni === "tetap"
                          ? "success"
                          : "warning"
                      }
                    >
                      {resident.status_penghuni === "tetap"
                        ? "Warga Tetap"
                        : "Kontrak"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {resident.nomor_telepon}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {resident.sudah_menikah ? "Sudah Menikah" : "Belum Menikah"}
                  </TableCell>

                  {/* Kolom Tombol Edit */}
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEditClick(resident)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

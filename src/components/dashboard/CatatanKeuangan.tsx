import { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
// 1. IMPORT INSTANCE API KUSTOM ANDA (Sesuaikan path ke file util.tsx)
import api from "../../util/api";
import { CalenderIcon } from "../../icons";

interface SummaryData {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

export default function CatatanKeuangan() {
  const datePickerRef = useRef<HTMLInputElement>(null);

  // State Utama Grafik
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [chartData, setChartData] = useState<SummaryData[]>([]);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ambil Data Summary Kas dari Backend Laravel
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setIsLoading(true);

        // 2. MENGGUNAKAN API INSTANCE
        // Path diringkas, token otomatis disisipkan lewat interceptor di util.tsx
        const response = await api.get(`/dashboard/summary`, {
          params: { year: selectedYear },
        });

        if (response.data) {
          setChartData(response.data.data || []);
          setTotalSaldo(response.data.total_saldo_tahunan || 0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal memuat data grafik statistik:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [selectedYear]);

  // Inisialisasi Flatpickr (Khusus Pemilih Tahun)
  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      static: true,
      dateFormat: "Y",
      defaultDate: selectedYear.toString(),
      clickOpens: true,
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          setSelectedYear(selectedDates[0].getFullYear());
        }
      },
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, [selectedYear]);

  // Pemetaan Data Array dari State ke format ApexCharts
  const categories = chartData.map((item) => item.bulan);
  const dataPemasukan = chartData.map((item) => item.pemasukan);
  const dataPengeluaran = chartData.map((item) => item.pengeluaran);
  const dataSaldo = chartData.map((item) => item.saldo);

  // Konfigurasi ApexCharts Responsif
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#10B981", "#EF4444", "#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [3, 3, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(val),
      },
    },
    xaxis: {
      type: "category",
      categories:
        categories.length > 0
          ? categories
          : [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
          return val.toString();
        },
      },
    },
  };

  const series = [
    { name: "Uang Masuk (Pemasukan)", data: dataPemasukan },
    { name: "Uang Keluar (Pengeluaran)", data: dataPengeluaran },
    { name: "Sisa Saldo Kas", data: dataSaldo },
  ];

  const formatRupiahGlobal = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Grafik Statistik Keuangan RT
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Total Sisa Saldo Kas Tahun {selectedYear}: &nbsp;
            <span
              className={`font-bold ${totalSaldo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
            >
              {formatRupiahGlobal(totalSaldo)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-32 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer text-center"
              placeholder="Pilih Tahun"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[310px] space-y-2">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm animate-pulse">
              Menghitung arus kas RT...
            </span>
          </div>
        ) : (
          <Chart options={options} series={series} type="area" height={310} />
        )}
      </div>
    </div>
  );
}

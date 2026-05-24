import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TabelPengeluaran from "../../components/expense/TabelPengeluaran";

export default function ExpenseList() {
  return (
    <>
      <PageMeta
        title="RT Management | Data Pengeluaran"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tabel Pengeluaran" />
      <div className="space-y-6">
        <TabelPengeluaran />
      </div>
    </>
  );
}

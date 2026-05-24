import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import FormPengeluaran from "../../components/expense/FormPengeluaran";

export default function ExpenseForm() {
  return (
    <div>
      <PageMeta
        title="RT Management | Form Pengeluaran"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tambah Pengeluaran" />

      <FormPengeluaran />
    </div>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TabelPembayaran from "../../components/payment/TabelPembayaran";

export default function PaymentList() {
  return (
    <>
      <PageMeta
        title="RT Management | Data Pembayaran"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tabel Pembayaran" />
      <div className="space-y-6">
        <TabelPembayaran />
      </div>
    </>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FormPembayaran from "../../components/payment/FormPembayaran";

export default function PaymentForm() {
  return (
    <div>
      <PageMeta
        title="RT Management | Form Pembayaran"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tambah Pembayaran" />

      <FormPembayaran />
    </div>
  );
}

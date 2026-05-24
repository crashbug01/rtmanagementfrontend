import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import FormWarga from "../../components/resident/FormWarga";
import PageMeta from "../../components/common/PageMeta";

export default function ResidentForm() {
  return (
    <div>
      <PageMeta
        title="RT Management | Form Warga"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tambah Warga" />

      <FormWarga />
    </div>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FormRumah from "../../components/house/FormHouse";

export default function HouseForm() {
  return (
    <div>
      <PageMeta
        title="RT Management | Form Rumah"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tambah Rumah" />

      <FormRumah />
    </div>
  );
}

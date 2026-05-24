import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TabelWarga from "../../components/resident/TabelWarga";

export default function ResidentList() {
  return (
    <>
      <PageMeta
        title="RT Management | Data Warga"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Data Warga" />
      <div className="space-y-6">
        <TabelWarga />
      </div>
    </>
  );
}

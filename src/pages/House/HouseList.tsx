import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TabelRumah from "../../components/house/TabelRumah";

export default function HouseList() {
  return (
    <>
      <PageMeta
        title="RT Management | Data Rumah"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tabel Rumah" />
      <div className="space-y-6">
        <TabelRumah />
      </div>
    </>
  );
}

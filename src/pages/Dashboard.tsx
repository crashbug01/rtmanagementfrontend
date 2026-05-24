import PageMeta from "../components/common/PageMeta";
import CatatanKeuangan from "../components/dashboard/CatatanKeuangan";

export default function Dashboard() {
  return (
    <>
      <PageMeta
        title="Dashboard | RT Management"
        description="Pantau ringkas data RT"
      />
      <div className="grid  col-span-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <CatatanKeuangan />
        </div>
      </div>
    </>
  );
}

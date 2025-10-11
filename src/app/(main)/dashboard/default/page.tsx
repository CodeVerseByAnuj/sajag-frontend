import { ChartAreaInteractiveDynamic } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import data from "./_components/data.json";
import { SectionCards } from "./_components/section-cards";
import ChartTooltipDefault from "./_components/chart-tooltip-default";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractiveDynamic />
      <ChartTooltipDefault />
      {/* <DataTable data={data} /> */}
    </div>
  );
}

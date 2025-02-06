"use client";

import { HotTable, HotColumn } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { urlRenderer } from "@/components/hot/renderers/url-renderer";
import { useRef } from "react";

// Register all Handsontable modules
registerAllModules();

// Static data for testing
const staticData = [
  { id: 1, name: "Company A", website: "https://example1.com" },
];

export function HotTest() {
  const hotRef = useRef<any>(null);
  console.log("HotTest render");

  return (
    <div className="h-[400px] m-4">
      <HotTable
        ref={hotRef}
        data={staticData}
        licenseKey="non-commercial-and-evaluation"
        height="100%"
        width="100%"
        rowHeaders={true}
        colHeaders={true}
      >
        <HotColumn data="id" title="ID" readOnly={true} />
        <HotColumn data="name" title="Name" />
        <HotColumn data="website" title="Website" renderer={urlRenderer} />
      </HotTable>
    </div>
  );
}

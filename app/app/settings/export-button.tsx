"use client";

import { exportMyData } from "@/lib/actions";

export function ExportButton() {
  return (
    <button
      className="btn btn-secondary mt-3"
      type="button"
      onClick={async () => {
        const { json } = await exportMyData();
        const blob = new Blob([json], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "freeiep-export.json";
        a.click();
      }}
    >
      Export my data
    </button>
  );
}

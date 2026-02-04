import React from "react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <SettingsPanel onClose={() => {}} />
    </div>
  );
}

// src/utils/att.ts
export const fmtTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" });
  };
export const khStatus = (s: "checkin" | "checkout") => (s === "checkin" ? "ចូលរៀន" : "ចេញរៀន");
export const dayKey = (isoDate: string) => isoDate; // already YYYY-MM-DD
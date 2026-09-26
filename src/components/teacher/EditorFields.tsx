import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}</label>;
}
export function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <Field label={label}>{multiline ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-24" /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}</Field>;
}
export function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <Field label={label}><Textarea value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n").filter(Boolean))} className="min-h-28" placeholder="عنصر في كل سطر" /></Field>;
}

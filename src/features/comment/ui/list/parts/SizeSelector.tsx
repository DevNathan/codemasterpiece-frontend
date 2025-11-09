"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/shadcn/select";

type Props = { value: number; options?: number[]; onChange: (n:number)=>void };
const DEFAULTS = [5, 10, 20, 50];

export default function SizeSelector({ value, options = DEFAULTS, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">표시 개수</span>
      <Select value={String(value)} onValueChange={(v)=>onChange(Math.max(1, parseInt(v||"5",10)))}>
        <SelectTrigger className="w-[96px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

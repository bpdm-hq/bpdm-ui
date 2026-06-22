// `cn` lives in the shared, framework-agnostic @bpdm/variants package so the
// React and Angular components merge classes identically. Re-exported here so
// existing `import { cn } from "@/lib/utils"` call sites stay unchanged.
export { cn, type ClassValue } from "@bpdm/variants";

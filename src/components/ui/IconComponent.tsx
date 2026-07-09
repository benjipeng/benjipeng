import { ReactNode } from "react";

/** Pass-through wrapper kept for tech icon list compatibility. */
export default function IconComponent({ icon }: { icon: ReactNode }) {
  return <>{icon}</>;
}

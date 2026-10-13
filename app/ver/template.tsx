import { Transicion } from "@/components/Transicion";

export default function Template({ children }: { children: React.ReactNode }) {
  return <Transicion>{children}</Transicion>;
}

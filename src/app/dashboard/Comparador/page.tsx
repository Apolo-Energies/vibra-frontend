import { Comparador } from "./components/Comparador";
import { auth } from "@/auth.config";

export default async function ComparadorPage() {
  const session = await auth();
  const token = (session?.user as { token?: string })?.token ?? "";
  return <Comparador token={token} />;
}
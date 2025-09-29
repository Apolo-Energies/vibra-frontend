import { signIn } from "@/auth.config";

export default function AuthPage() {
  const handleLogin = async () => {
    // Si tienes la api_key en .env:
    await signIn("credentials");

    // O si quieres pasarla en query param:
    // await signIn("credentials", { callbackUrl: "/dashboard", api_key: "SRC_xxx" });
  };
  return (
    <div>
      <h1>Página de inicio</h1>
      <button onClick={handleLogin}>Entrar con API Key</button>
    </div>
  );
}

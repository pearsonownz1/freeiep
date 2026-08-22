import { redeemLogin } from "@/lib/actions";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    try {
      await redeemLogin(token);
    } catch (e) {
      return <LoginForm error={e instanceof Error ? e.message : "That link did not work."} />;
    }
  }
  return <LoginForm />;
}

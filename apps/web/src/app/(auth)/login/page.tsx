import { getServerSession } from "@/features/auth/admin-session";
import SignInForm from "@/features/auth/components/sign-in-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/dashboard");
    } else {
      redirect("/"); // Regular users go to home
    }
  }

  return <SignInForm />;
}

import { getServerSession } from "@/features/auth/admin-session";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getServerSession();

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/dashboard");
    } else {
      redirect("/"); // Regular users go to home
    }
  }

  return <SignUpForm />;
}

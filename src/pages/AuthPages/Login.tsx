import PageMeta from "../../components/common/PageMeta";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <>
      <PageMeta title="Login" description="Login Page" />

      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <LoginForm />
      </div>
    </>
  );
}

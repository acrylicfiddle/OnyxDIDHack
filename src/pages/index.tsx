import { useRouter } from "next/router";

const Index = () => {
    const router = useRouter();
    return (
      <div className="dashboard-container">
        <button className="login-button" onClick={() => router.push('/sign-up')}>Sign Up</button>
      </div>
    )
};

export default Index;
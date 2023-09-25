import { useRouter } from "next/router";

const Index = () => {
    const router = useRouter();
    return (
      <div className="parent-container">
        <div className="landing-container">
          <h1 className="landing-title">Convenient Place To Manage Your Assets In Bulk</h1>
          <p className="landing-description">Convenient Place To Manage Your Assets In Bulk</p>
          <button className="landing-button" onClick={() => router.push('/sign-up')}>Get Started</button>
        </div>
        <div className="half-circle"></div>
        <div className="landing-container-2">
          <h1 className="landing-title">Supported Tech</h1>
        </div>
      </div>
    )
};

export default Index;
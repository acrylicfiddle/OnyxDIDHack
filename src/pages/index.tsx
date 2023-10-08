import Header from "@/ui/HeaderHompage";
import LogoBox from "@/ui/LogoBox";
import LogoDescriptionBox from "@/ui/LogoDescriptionBox";
import { useRouter } from "next/router";

const Index = () => {
    const router = useRouter();
    return (
      <div className="parent-container">
        <Header />
        <div className="landing-container">
          <h1 className="landing-title">Unified Management of Decentralized Identities & Digital Assets</h1>
          <p className="landing-description">Seamlessly Manage your Decentralized Identities, Credentials, and Assets in one place</p>
          <button className="landing-button" onClick={() => router.push('/sign-up')}>Get Started</button>
        </div>
        <div className="half-circle"></div>
        <div className="landing-container-2">
          <h1 className="landing-title">Supported Tech</h1>
          <LogoBox />
          <LogoDescriptionBox />
        </div>
      </div>
    )
};

export default Index;
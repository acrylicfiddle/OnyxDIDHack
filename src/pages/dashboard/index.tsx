import dynamic from "next/dynamic";
import MagicProvider from "../../../components/magic/magic-provider";

const Index = () => {
    const SocialLoginDynamic = dynamic(
        () => import("../../../components/dashboard/social-login").then((res) => res.default),
        {
          ssr: false,
        }
    );
    

    return (
        <>
            <MagicProvider>
                <SocialLoginDynamic />
            </MagicProvider>
        </>
    );
}

export default Index;
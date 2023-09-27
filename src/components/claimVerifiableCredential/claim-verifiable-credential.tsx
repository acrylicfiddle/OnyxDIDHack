import Button from "../Button";
import { createVc } from "../../utils/create-and-sign-vc";
import { useState } from "react";

const ClaimVerifiableCredential = ({ address }: { address: string }) => {
  const [vcJwt, setVcJwt] = useState("");

  const handleClaim = async () => {
    const vcJwt = await createVc(address);
    setVcJwt(vcJwt);
  };

  return vcJwt.length ? vcJwt : <Button onClick={handleClaim}>Claim VC</Button>;
};

export default ClaimVerifiableCredential;

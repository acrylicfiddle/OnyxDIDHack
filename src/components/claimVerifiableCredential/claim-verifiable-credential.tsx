import { CredentialPayload } from "did-jwt-vc";
import Button from "@/ui/Button";
import { createVc } from "../../utils/create-and-sign-vc";
import { useState } from "react";
import { useMagic } from "../magic/magic-provider";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { BiconomySmartAccount } from "@biconomy/account";
import { registerBiconomyDid, registerZkSyncDid } from "@/utils/register-did";
import { ES256KSigner, createAndSignVP } from "@/utils/create-and-sign-vp";
import { getNetworkNameforOnyx } from "@/utils/network";

const ClaimVerifiableCredential = ({ address, smartAccount }: { address: string, smartAccount: BiconomySmartAccount | null }) => {
  const [vcJwt, setVcJwt] = useState<CredentialPayload[]>();
  const [vpJwt, setVpJwt] = useState<string[]>();
  const [signedVcJwt, setSignedVcJwt] = useState<string[]>();
  const [selectedVc, setSelectedVc] = useState<number | null>(null);

  let { provider } = useMagic();
  const network = useSelector((state: RootState) => state.network.network) ?? provider?.network?.name;
  const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
  const handleClaim = async () => {
    let vcRes = await createVc(address, network);
    setVcJwt(vcRes.payload);
    setSignedVcJwt(vcRes.signedRes);
    
    if (!provider) {
      return;
    }
    console.log(network);
    if (network !== 'zksync-era-testnet' && smartAccount) {
      await registerBiconomyDid(network, provider, smartAccount, address);
    } else if (network == 'zksync-era-testnet') {
      await registerZkSyncDid(provider, address, emailOrHandle);
    }
  };

  const handleActionOnSelectedVc = async (selectedIndex: number | null) => {
    if (selectedIndex === null) { 
      return;
    }
    const selectedCredential = signedVcJwt ? signedVcJwt[selectedIndex] : null;
    const signer = await provider?.getSigner();
    if (selectedCredential) {
      const holder = {
        did: `did:ethr:${getNetworkNameforOnyx(network)}:${address}`,
        signer: ES256KSigner(signer),
      }
      const vp = await createAndSignVP(holder, [selectedCredential], {});
      console.log(vp);
      if (!vp) {
        return;
      }
      if (vpJwt?.includes(vp)) {
        console.log("VP already generated");
      } else {
        setVpJwt(prevVpJwt => [...(prevVpJwt || []), vp]);
      }
      console.log(vpJwt)
    }
  };



  return (
    <div>
      <div>
        <Button onClick={handleClaim}>Check my VCs</Button>
        <button 
          className="send-button"
          onClick={() => handleActionOnSelectedVc(selectedVc)}
          disabled={selectedVc === null}    
        >Sign</button>
      </div>
      {vcJwt && (
        vcJwt.map((item, index) => (
          <VcCard 
            key={index} 
            data={item} 
            index={index}
            onSelect={(selectedIndex) => setSelectedVc(prev => prev !== selectedIndex ? selectedIndex : null)}
            isSelected={selectedVc === index}
          />
        ))
      )}
      {vpJwt && (
        <div>
          <div className='login-hr'/>
        </div>
      )}
      {vpJwt && (
        vpJwt.map((item, index) => (
          <VpCard 
            key={index} 
            data={item} 
            index={mapIndex(index)}
          />
        ))
      )

      }
    </div>
  ) 

};

const VcCard = ({ data, index, onSelect, isSelected }: { data: CredentialPayload, index: number, onSelect: (index: number) => void, isSelected: boolean })=> {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    onSelect(index);
  };

  return (
    <div className={`credential-card ${isSelected ? 'selected' : ''}`} onClick={toggleOpen}>
      <h3>Credential: {mapIndex(index)|| 'N/A'}</h3>
      {isOpen && <pre className="credential-json">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

const VpCard = ({ data, index }: { data: string, index: string}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`credential-card`} onClick={toggleOpen}>
      <h3>Signed Presentation JWT: {index || 'N/A'}</h3>
      {isOpen && <pre className="presentation-json">{data}</pre>}
    </div>
  );
};

function mapIndex (index: number) {
  switch (index) {
    case 0:
      return 'Proof of Address';
    case 1:
      return 'Proof of Hackathon Participation';
    case 2:
      return 'Proof of DID Enthusiast';
    default:
      return 'N/A';
  }
}

export default ClaimVerifiableCredential;

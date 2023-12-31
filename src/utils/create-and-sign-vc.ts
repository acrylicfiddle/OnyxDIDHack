import {
  KeyDIDMethod,
  createAndSignCredentialJWT,
  createCredential,
} from "@jpmorganchase/onyx-ssi-sdk";
import { privateKeyBufferFromString } from "./convertions";
import { getNetworkNameforOnyx } from "./network";

export const createVc = async (address: string, network: string) => {
  console.log(process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY);

  const didKey = new KeyDIDMethod();

  const issuerDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(
      process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY ||
        "9f49873842a2f3d87e5d043e71c109c806189fa8fb987f2ee6682c465b8d10de20c89749843c44ce5c93c467d8fd28a9c4f6db24a1ad5fc582db7af4072af834"
    )
  );

  const holderDid = `did:ethr:${getNetworkNameforOnyx(network)}:${address}`;

  const vcDidKey = (await didKey.create()).did;

  //vc id, expirationDate, credentialStatus, credentialSchema, etc
  const additionalParams = {
    id: vcDidKey,
  };

  // console.log(
  //   `\nGenerating a signed verifiable Credential of type ${credentialType}\n`
  // );

  const signedVcAddress = await createAndSignCredentialJWT(
    issuerDidWithKeys,
    holderDid,
    {
      address,
    },
    ["PROOF_OF_ADDRESS"],
    additionalParams
  );

  const signedVcParticipant = await createAndSignCredentialJWT(
    issuerDidWithKeys,
    holderDid,
    {
      OnyxHackathonParticipant: true,
    },
    ["PROOF_OF_ONYX_HACKATHON_PARTICIPANT"],
    additionalParams
  );

  const signedVcDIDEnthusiast = await createAndSignCredentialJWT(
    issuerDidWithKeys,
    holderDid,
    {
      DIDEnthusiast: true,
    },
    ["PROOF_OF_DID_ENTHUSIAST"],
    additionalParams
  );  

  const proofOfAddress = createCredential(
    issuerDidWithKeys.did,
    holderDid,
    {
      address,
    },
    ["PROOF_OF_ADDRESS"],
    additionalParams
  );

  const proofOfParticipant = createCredential(
    issuerDidWithKeys.did,
    holderDid,
    {
      OnyxHackathonParticipant: true,
    },
    ["PROOF_OF_ONYX_HACKATHON_PARTICIPANT"],
    additionalParams
  );

  const proofOfDIDEnthusiast = createCredential(
    issuerDidWithKeys.did,
    holderDid,
    {
      DIDEnthusiast: true,
    },
    ["PROOF_OF_DID_ENTHUSIAST"],
    additionalParams
  );

  // console.log(signedVc);

  return {
      signedRes: [signedVcAddress, signedVcParticipant, signedVcDIDEnthusiast],
      payload: [proofOfAddress, proofOfParticipant, proofOfDIDEnthusiast],
    };
};

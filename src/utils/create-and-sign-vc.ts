import {
  KeyDIDMethod,
  createAndSignCredentialJWT,
  createCredential,
} from "@jpmorganchase/onyx-ssi-sdk";
import { privateKeyBufferFromString } from "./convertions";

export const createVc = async (address: string) => {
  console.log(process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY);

  const didKey = new KeyDIDMethod();

  const issuerDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(
      process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY ||
        "9f49873842a2f3d87e5d043e71c109c806189fa8fb987f2ee6682c465b8d10de20c89749843c44ce5c93c467d8fd28a9c4f6db24a1ad5fc582db7af4072af834"
    )
  );

  const holderDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(
      process.env.NEXT_PUBLIC_HOLDER_EDDSA_PRIVATE_KEY ||
        "77d4cb97863d92c15f567d04d5c8313a00657d564f1d9a8b276793c1c588a3fe95f1614c10adc0b60b7bd1d13a39ec012657e2ca2d72f0a319c1c2e7ab1b27fd"
    )
  );

  const vcDidKey = (await didKey.create()).did;

  //vc id, expirationDate, credentialStatus, credentialSchema, etc
  const additionalParams = {
    id: vcDidKey,
  };

  // console.log(
  //   `\nGenerating a signed verifiable Credential of type ${credentialType}\n`
  // );

  // const signedVc = await createAndSignCredentialJWT(
  //   issuerDidWithKeys,
  //   holderDidWithKeys.did,
  //   subjectData,
  //   [credentialType],
  //   additionalParams
  // );

  const proofOfAddress = createCredential(
    issuerDidWithKeys.did,
    holderDidWithKeys.did,
    {
      address,
    },
    ["PROOF_OF_ADDRESS"],
    additionalParams
  );

  const proofOfParticipant = createCredential(
    issuerDidWithKeys.did,
    holderDidWithKeys.did,
    {
      OnyxHackathonParticipant: true,
    },
    ["PROOF_OF_ONYX_HACKATHON_PARTICIPANT"],
    additionalParams
  );

  const proofOfDIDEnthusiast = createCredential(
    issuerDidWithKeys.did,
    holderDidWithKeys.did,
    {
      DIDEnthusiast: true,
    },
    ["PROOF_OF_DID_ENTHUSIAST"],
    additionalParams
  );

  // console.log(signedVc);

  return [proofOfAddress, proofOfParticipant, proofOfDIDEnthusiast];
};

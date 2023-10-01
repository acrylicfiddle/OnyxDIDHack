import {
  KeyDIDMethod,
  createAndSignCredentialJWT,
} from "@jpmorganchase/onyx-ssi-sdk";
import { privateKeyBufferFromString } from "./convertions";

export const createVc = async (address: string) => {
  console.log(process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY);

  const didKey = new KeyDIDMethod();

  const issuerDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(
      process.env.NEXT_PUBLIC_ISSUER_EDDSA_PRIVATE_KEY || ""
    )
  );

  const holderDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(
      process.env.NEXT_PUBLIC_HOLDER_EDDSA_PRIVATE_KEY || ""
    )
  );

  const vcDidKey = (await didKey.create()).did;

  const credentialType = "PROOF_OF_ADDRESS";

  const subjectData = {
    address,
  };

  //vc id, expirationDate, credentialStatus, credentialSchema, etc
  const additionalParams = {
    id: vcDidKey,
  };

  console.log(
    `\nGenerating a signed verifiable Credential of type ${credentialType}\n`
  );

  const signedVc = await createAndSignCredentialJWT(
    issuerDidWithKeys,
    holderDidWithKeys.did,
    subjectData,
    [credentialType],
    additionalParams
  );

  console.log(signedVc);

  return signedVc;
};

import { createVerifiablePresentationJwt, VerifiableCredential } from "did-jwt-vc";
import { Issuer, PresentationPayload, CreatePresentationOptions } from "did-jwt-vc/lib/types";
import { createPresentation } from "@jpmorganchase/onyx-ssi-sdk";
import { hash } from '@stablelib/sha256'
import * as u8a from 'uint8arrays'
import { ethers } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Signer as ZkSigner } from "zksync-web3";

interface EcdsaSignature {
    r: string
    s: string
    recoveryParam?: number | null
}

export type Signer = (data: string | Uint8Array) => Promise<EcdsaSignature | string>;

export async function createAndSignVP(
    holder: Issuer, 
    verifiableCredentials: VerifiableCredential[] | null,
    options: CreatePresentationOptions
) {
    if (verifiableCredentials === null) {
        return;
    }
    const payload = createPresentation(holder.did, verifiableCredentials)
    return await createVerifiablePresentationJwt(payload, holder, options);
}

 function extractSignatureParameters(signature: string) {
    if (signature.length !== 132) {
        throw new Error('Invalid signature length');
    }

    const r = signature.slice(2, 66);
    const s = signature.slice(66, 130);
    
    let recoveryParam = parseInt(signature.slice(130, 132), 16);

    
    if (recoveryParam < 27) {
        recoveryParam += 27;
    }

    return { r, s, recoveryParam };
}

export function ES256KSigner(signer: JsonRpcSigner | ZkSigner | undefined, recoverable = false): Signer {
    if (signer === undefined) {
        throw new Error('Signer is undefined');
    }
    return async (data: string | Uint8Array): Promise<string> => {
        const sig = await signer.signMessage(ethers.utils.arrayify(sha256(data)));
        console.log(sig);
        const { r, s, recoveryParam } = extractSignatureParameters(sig)
        return toJose({ r, s, recoveryParam }, recoverable)
    }
}

export function toJose({ r, s, recoveryParam }: EcdsaSignature, recoverable?: boolean): string {
    const jose = new Uint8Array(recoverable ? 65 : 64)
    jose.set(u8a.fromString(r, 'base16'), 0)
    jose.set(u8a.fromString(s, 'base16'), 32)
    if (recoverable) {
      if (typeof recoveryParam === 'undefined') {
        throw new Error('Signer did not return a recoveryParam')
      }
      jose[64] = <number>recoveryParam
    }
    return bytesToBase64url(jose)
}

export function bytesToBase64url(b: Uint8Array): string {
    return u8a.toString(b, 'base64url')
}

export function sha256(payload: string | Uint8Array): Uint8Array {
    const data = typeof payload === 'string' ? u8a.fromString(payload) : payload
    return hash(data)
}
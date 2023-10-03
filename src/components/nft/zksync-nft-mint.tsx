import deployZkSyncAccount from "@/utils/account-deploy";
import { ethers } from "ethers";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SeamlessNftAbi from "@/utils/abi/seamless-nft-abi.json";
import AccountAbi from "@/utils/abi/account-abi.json";
import { getNftContractAddress } from "@/utils/address";
import { toast, ToastContainer } from 'react-toastify';
import { getPrePaymasterParams } from "@/utils/get-paymaster-param";
import { utils, types, Provider, EIP712Signer } from "zksync-web3";
import Button from "../Button";
import { useMagic } from "../magic/magic-provider";
import { EIP712_TX_TYPE } from "zksync-web3/build/src/utils";
import { splitSignature } from "ethers/lib/utils";

interface Props {
    address: string,
}

const zkSyncProvider = new Provider("https://testnet.era.zksync.dev");

const MintZkSyncNFT: React.FC<Props> = ({address}) => {
    const [minted, setMinted] = useState(false);
    const network = useSelector((state: RootState) => state.network.network);
    const nftAddress = getNftContractAddress(network);
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    const contract = new ethers.Contract(
        nftAddress,
        SeamlessNftAbi,
        zkSyncProvider,
    );
    const { provider } = useMagic();
    if (!provider) {
        console.error('provider is undefined');
        return;
    }
    console.log(provider);
    let url: string = '';

    const handleTx = async () => {
        try {
            toast.info('Minting your Seamless NFT...', {
                position: "top-right",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            const code = await provider.getCode(address);
            console.log('code is ',{ code })
            const signer = await provider.getSigner();
            if (code == '0x') {
                if (emailOrHandle == undefined) { 
                    console.error('emailOrHandle is undefined');
                    return; 
                }
                const salt = ethers.utils.formatBytes32String(emailOrHandle);
                await deployZkSyncAccount(signer, salt);
            };
            const accountContract = new ethers.Contract(
                address,
                AccountAbi,
                provider,
            );
            console.log('account address is ', address);
            
            const paymasterParams = await getPrePaymasterParams(signer);
            console.log('paymasterParams is ', paymasterParams);
            const mintTx = await contract.populateTransaction.mint(1);
            console.log('Basic tx info', mintTx);

            // const gasLimit = await zkSyncProvider.estimateGas(mintTx);
            // console.log ({ gasLimit });
            const gasPrice = await zkSyncProvider.getGasPrice();
            // console.log ({ gasPrice });
            let tx1 = {
                ...mintTx,
                from: address,
                to: nftAddress,
                chainId: 280,
                gasLimit: ethers.BigNumber.from(1000000),
                gasPrice: gasPrice,
                nonce: await zkSyncProvider.getTransactionCount(address),
                type: 113,
                customData: {
                    paymasterParams: paymasterParams,
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                } as types.Eip712Meta,
                value: ethers.BigNumber.from(0),
            };

            console.log(utils.serialize(tx1));
            const eip712Signer = new EIP712Signer(signer, 280);
            const signature = await eip712Signer.sign(tx1);

            tx1.customData = {
                ...tx1.customData,
                customSignature: signature,
            };

            let tx = await zkSyncProvider.sendTransaction(utils.serialize(tx1));
            const receipt = await tx.wait(1);
            const txhash = receipt.transactionHash;
            console.log({ tx });
            console.log({ receipt });
            
            toast.success(`Success! Here is your transaction: ${receipt.transactionHash} `, {
                position: "top-right",
                autoClose: 18000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            url = `https://goerli.explorer.zksync.io/tx/${txhash}`;
            setMinted(true);
        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }

    return (
        <>
            {address && <Button onClick={handleTx} >Mint NFT</Button>}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {minted && 
                <div className='opensea-link'>
                    <p>Congrats! Check your tx hash at&nbsp;
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#ff0000', textDecoration: 'underline' }}
                        >
                            ZkSync Explorer
                        </a>
                    </p>
                </div>
            }
        </>
    )
}

export default MintZkSyncNFT;
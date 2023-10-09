import deployZkSyncAccount from "@/utils/account-deploy";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SeamlessNftAbi from "@/utils/abi/seamless-nft-abi.json";
import { getNftContractAddress } from "@/utils/address";
import { toast, ToastContainer } from 'react-toastify';
import { getPrePaymasterParams } from "@/utils/get-paymaster-param";
import { utils, types, Provider, EIP712Signer } from "zksync-web3";
import Button from "@/ui/Button";
import { useMagic } from "../magic/magic-provider";
import getUserInfo from "@/utils/get-user-info";
import { SendPopup } from './send-nft';

interface Props {
    address: string,
}

const zkSyncProvider = new Provider("https://testnet.era.zksync.dev");

const MintZkSyncNFT: React.FC<Props> = ({address}) => {
    const [nfts, setNfts] = useState<string[]>([]);
    const [minted, setMinted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSend, setShowSend] = useState(false);
    const showSendPopup = () => setShowSend(true);
    const [selectedNFT, setSelectedNFT] = useState<string>('');

    const network = useSelector((state: RootState) => state.network.network);
    const nftAddress = getNftContractAddress(network);
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    const contract = new ethers.Contract(
        nftAddress,
        SeamlessNftAbi,
        zkSyncProvider,
    );
    const { provider } = useMagic();
    
    console.log(provider);

    useEffect(() => {
        const fetchNFTs = async () => {
            let userNFTs: string[] = [];
            const tokenIds: string[] = await contract.walletOfOwner(address);
            for (let i = 0; i < tokenIds.length; i++) {
                try {
                    userNFTs.push(tokenIds[i]);
                } catch (error) {
                  break;
                }
            }
            setNfts(userNFTs);
        };

        fetchNFTs();
    }, [address, minted]);

    const toggleNFTSelection = (nftId: string) => {
        setSelectedNFT(nftId);
    };

    const handleTx = async () => {
        if (!provider) {
            console.error('provider is null');
            return;
        }
        try {
            setMinted(false);
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
            
            console.log('account address is ', address);
            
            const paymasterParams = await getPrePaymasterParams(address);
            console.log('paymasterParams is ', paymasterParams);
            const mintTx = await contract.populateTransaction.mint(1);
            console.log('Basic tx info', mintTx);

            
            const gasPrice = await zkSyncProvider.getGasPrice();
            
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
            setMinted(true);
        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }

    
    const handleSend = async (destination: string) => {
        if (!provider) {
            console.error('provider is null');
            return;
        }
        setMinted(false);
        console.log(`Sending NFTs: ${selectedNFT} to ${destination}`);
        const userInfo = await getUserInfo(destination, network, address);
        if (!userInfo) {
            toast.error(`Error processing user.`, {
                position: "top-right",
                autoClose: 18000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                });
            return;
        }
        console.log('userInfo: ', userInfo);
        setLoading(true);
        toast.info('Sending your Seamless NFT...', {
            position: "top-right",
            autoClose: 15000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });

        const signer = await provider.getSigner();
        
        console.log("here before userop")
        const paymasterParams = await getPrePaymasterParams(address);

        console.log('paymasterParams is ', paymasterParams);
        const mintTx = await contract.populateTransaction.transferFrom(
            address,
            userInfo.smartAccount,
            selectedNFT,
        );
        console.log('Basic tx info', mintTx);

        
        const gasPrice = await zkSyncProvider.getGasPrice();
        
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
        setLoading(false);
        setMinted(true);
        setSelectedNFT('');
        setShowSend(false);
    };


    return (
        <>
            {address &&(
                <div>
                    <Button onClick={handleTx} >Mint NFT</Button>
                    <button 
                        className="send-button"
                        disabled={!selectedNFT} 
                        onClick={showSendPopup}
                    >
                        Send
                    </button>
                    { showSend && <SendPopup handleSend={handleSend} setShowSend={setShowSend} loading={loading} /> }

                    <div className="nft-header">
                        <h2>Your NFTs</h2>
                    </div>
                    <div className="nft-grid">
                        {nfts.map((nft, index) => (
                            <div 
                                key={index} 
                                className={`nft-card ${selectedNFT == nft ? 'selected' : ''}`} 
                                onClick={() => toggleNFTSelection(nft)}
                            >
                                <img src='/seamless-nft.png' alt="NFT" />
                                <h4>Seamless Welcome NFT #{nft.toString()}</h4>
                                {selectedNFT == nft && <div className="checkmark">✓</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
            
        </>
    )
}

export default MintZkSyncNFT;
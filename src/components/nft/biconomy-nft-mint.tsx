
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import SeamlessNftAbi from "@/utils/abi/seamless-nft-abi.json"
import {
IHybridPaymaster,
SponsorUserOperationDto,
PaymasterMode
} from '@biconomy/paymaster'
import { BiconomySmartAccount } from "@biconomy/account"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getNftContractAddress } from '@/utils/address';
import { batch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Button from '@/ui/Button';
import { useMagic } from '../magic/magic-provider';
import getUserInfo from '@/utils/get-user-info';
import { SendPopup } from './send-nft';

interface Props {
    smartAccount: BiconomySmartAccount,
    address: string,
}

const MintNFT: React.FC<Props> = ({ smartAccount, address }) => {
    const [minted, setMinted] = useState(false);
    const [nfts, setNfts] = useState<string[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [nftCount, setNftCount] = useState(1);
    const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
    const [showSend, setShowSend] = useState(false);
    const showSendPopup = () => setShowSend(true);
    const [loading, setLoading] = useState(false);
    const network = useSelector((state: RootState) => state.network.network);
    const nftAddress = getNftContractAddress(network);
    const { provider } = useMagic();
    const contract = provider
        ? new ethers.Contract(nftAddress, SeamlessNftAbi, provider)
        : undefined;
    console.log('contract is ', contract);

    useEffect(() => {
        if (!contract) return;
        const fetchNFTs = async () => {
            let userNFTs: string[] = [];
            const tokenIds: string[] = await contract.walletOfOwner(address);
            for (let i = 0; i < tokenIds.length; i++) {
                userNFTs.push(tokenIds[i]);
            }
            setNfts(userNFTs);
        };

        fetchNFTs();
    }, [address, minted]);

    const handleTx = async (count: number) => {
        if (!contract) return;
        try {
            setMinted(false);
            setLoading(true);
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
            const mintTx = await contract.populateTransaction.mint(1);
            console.log(mintTx.data);
            const tx1 = {
                to: nftAddress,
                data: mintTx.data,
            };
            console.log("here before userop")
            let batchedUserOp = [];
            for (let i = 0; i < count; i++) {
                batchedUserOp.push(tx1);
            };
            let userOp = await smartAccount.buildUserOp(batchedUserOp);
            console.log({ userOp })
            const biconomyPaymaster =
                smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
            let paymasterServiceData: SponsorUserOperationDto = {
                mode: PaymasterMode.SPONSORED,
            };
            const paymasterAndDataResponse =
            await biconomyPaymaster.getPaymasterAndData(
                userOp,
                paymasterServiceData
            );

            userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
            const userOpResponse = await smartAccount.sendUserOp(userOp);
            console.log("userOpHash", userOpResponse);
            const { receipt } = await userOpResponse.wait(1);
            console.log("txHash", receipt.transactionHash);
            setMinted(true);
            toast.success(`Success! Here is your transaction:${receipt.transactionHash} `, {
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
            
        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }

    const handleSend = async (destination: string) => {
        setMinted(false);
        if (!contract) return;
        // Here you'd typically interact with your smart contract or backend to send NFTs
        console.log(`Sending NFTs: ${selectedNFTs.join(', ')} to ${destination}`);
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
        
        console.log("here before userop")

        let batchedUserOp = [];
        for (let i = 0; i < selectedNFTs.length; i++) {
            const sendTx = await contract.populateTransaction.transferFrom(
                address,
                userInfo.smartAccount,
                selectedNFTs[i],
            );
            const tx1 = {
                to: nftAddress,
                data: sendTx.data,
            };
            batchedUserOp.push(tx1);
        };
        let userOp = await smartAccount.buildUserOp(batchedUserOp);
        console.log({ userOp })
        const biconomyPaymaster =
            smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
        let paymasterServiceData: SponsorUserOperationDto = {
            mode: PaymasterMode.SPONSORED,
        };
        const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
            userOp,
            paymasterServiceData
        );

        userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
        const userOpResponse = await smartAccount.sendUserOp(userOp);
        console.log("userOpHash", userOpResponse);
        const { receipt } = await userOpResponse.wait(1);
        console.log("txHash", receipt.transactionHash);
        toast.success(`Success! Here is your transaction:${receipt.transactionHash} `, {
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
        setSelectedNFTs([]);
        setShowSend(false);
    };
    

    const toggleNFTSelection = (nftId: string) => {
        if (selectedNFTs.includes(nftId)) {
            setSelectedNFTs(prev => prev.filter(id => id !== nftId));
        } else {
            setSelectedNFTs(prev => [...prev, nftId]);
        }
    };

    const MintPopup = () => {
        return (
            <div className="popup">
                <div className="popup-header">
                    <button className="close-btn" onClick={() => setShowPopup(false)}>X</button>
                    <h3>Unlock the Seamless Experience</h3>
                </div>
                <div className="popup-content">
                    <img src="/seamless-nft.png" alt="NFT Image" className="popup-image"/>
                    <form onSubmit={e => e.preventDefault()}>
                        <label htmlFor="nft-count">Number of NFTs:</label>
                        <input
                            id="nft-count"
                            type="number"
                            value={nftCount}
                            disabled={loading} 
                            onChange={e => setNftCount(Number(e.target.value))}
                        />
                        <button 
                            type="button" 
                            onClick={() => handleTx(nftCount)}
                            disabled={loading} 
                            className={loading ? "loading-btn" : ""}
                        >
                            {loading ? <div className="spinner"></div> : "Mint NFTs"}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    


    return(
        <>
            {address && (
                <div>
                    <Button onClick={() => setShowPopup(true)}>Mint NFT</Button>
                    <button 
                        className="send-button"
                        disabled={!selectedNFTs.length} 
                        onClick={showSendPopup}
                    >
                        Send
                    </button>
                    { showPopup && <MintPopup />}
                    { showSend && <SendPopup handleSend={handleSend} setShowSend={setShowSend} loading={loading} /> }

                    <div className="nft-header">
                        <h2>Your NFTs</h2>
                    </div>
                    <div className="nft-grid">
                        {nfts.map((nft, index) => (
                            <div 
                                key={index} 
                                className={`nft-card ${selectedNFTs.includes(nft) ? 'selected' : ''}`} 
                                onClick={() => toggleNFTSelection(nft)}
                            >
                                <img src='/seamless-nft.png' alt="NFT" />
                                <h4>Seamless Welcome NFT #{nft.toString()}</h4>
                                {selectedNFTs.includes(nft) && <div className="checkmark">✓</div>}
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


export default MintNFT;


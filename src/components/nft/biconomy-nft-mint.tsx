
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
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Button from '@/ui/Button';
import { useMagic } from '../magic/magic-provider';

interface Props {
    smartAccount: BiconomySmartAccount,
    address: string,
}

const MintNFT: React.FC<Props> = ({ smartAccount, address }) => {
    const [minted, setMinted] = useState(false);
    const network = useSelector((state: RootState) => state.network.network);
    const nftAddress = getNftContractAddress(network);
    const { provider } = useMagic();
    if (!provider) {
        console.error('provider is undefined');
        return;
    }
    const contract = new ethers.Contract(
        nftAddress,
        SeamlessNftAbi,
        provider,
    );
    console.log('contract is ', contract);
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
            const mintTx = await contract.populateTransaction.mint(1);
            console.log(mintTx.data);
            const tx1 = {
                to: nftAddress,
                data: mintTx.data,
            };
            console.log("here before userop")
            let userOp = await smartAccount.buildUserOp([tx1]);
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
            setMinted(true)
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
        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }

    const OpenseaLink: React.FC<{ contract: ethers.Contract, address: string }> = ({ contract, address }) => {
        const [tokenId, setTokenId] = useState(null);
        const networkName = network === 'ethereum-goerli' ? 'goerli' : 'mumbai';

        useEffect(() => {
            const fetchTokenId = async () => {
                try {
                    const id = await contract.tokenOfOwnerByIndex(address, 0);
                    setTokenId(id);
                } catch (error) {
                    console.error('Error fetching token ID:', error);
                }
            };

            fetchTokenId();
        }, [address, contract]);

        if (!tokenId) return null;

        const url = `https://testnets.opensea.io/assets/${networkName}/${contract.address}/${tokenId}`;

        return (
            <div className='opensea-link'>
                <p>Congrats! Check your NFT at&nbsp;
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#ff0000', textDecoration: 'underline' }}
                    >
                        Opensea
                    </a>
                </p>
            </div>
        );
    }

    return(
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
            {minted && <OpenseaLink contract={contract} address={address} />}
        </>
    )
}


export default MintNFT;


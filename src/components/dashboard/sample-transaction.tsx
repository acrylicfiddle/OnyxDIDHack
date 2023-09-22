
import { useState } from 'react';
import { ethers } from "ethers";
import CounterAbi from "../../utils/counter-abi.json"
import { 
IHybridPaymaster, 
SponsorUserOperationDto,
PaymasterMode
} from '@biconomy/paymaster'
import { BiconomySmartAccount } from "@biconomy/account"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { css } from '@emotion/css'

// Check out the Counter Contract here: https://goerli.etherscan.io/address/0xec01F158D265f683AF614b2DfE6a24a068576714#code
const counterAddress = "0xec01F158D265f683AF614b2DfE6a24a068576714"

interface Props {
    smartAccount: BiconomySmartAccount,
    address: string,
    provider: ethers.providers.Web3Provider,
}

const SampleTx: React.FC<Props> = ({ smartAccount, address, provider }) => {
    const [incremented, setIncremented] = useState(false)

    const handleTx = async () => {
        const contract = new ethers.Contract(
            counterAddress,
            CounterAbi,
            provider,
        )
        try {
            toast.info('Interacting with Counter Contract...', {
                position: "top-right",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            const counterTx = await contract.populateTransaction.increment();
            console.log(counterTx.data);
            const tx1 = {
                to: counterAddress,
                data: counterTx.data,
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
            setIncremented(true)
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

    
    return(
        <>
        {address && <button onClick={handleTx} className={buttonStyle}>Increment number</button>}
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


const buttonStyle = css`
  padding: 14px;
  width: 300px;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  outline: none;
  margin-top: 20px;
  transition: all .25s;
  &:hover {
    background-color: rgba(0, 0, 0, .2); 
  }
`

export default SampleTx;


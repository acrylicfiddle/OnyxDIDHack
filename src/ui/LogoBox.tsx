import Image from 'next/image';

function LogoBox() {
    return (
        <div>
            <Image src="/logos/magic.svg" alt="magic-logo" width={100} height={100} />
            <Image src="/logos/biconomy.svg" alt="biconomy-logo" width={100} height={100} />
            <Image src="/logos/ethereum.svg" alt="ethereum-logo" width={100} height={100} />
            <Image src="/logos/polygon.svg" alt="polygon-logo" width={100} height={100} />
            <Image src="/logos/zksync.svg" alt="" width={100} height={100} />
        </div>
    );
}

export default LogoBox;
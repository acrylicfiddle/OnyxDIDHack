import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
function HeadeLogin() {
    const router = useRouter();
    const handleHome = () => {
        router.push('/');
    };

    return (
        <header className="header-login">
            <div>
                <Image src="/seamless-header.png" alt="Seamless Logo" width={182} height={52} onClick={handleHome} />
            </div>
        </header>
    );
}

export default HeadeLogin;
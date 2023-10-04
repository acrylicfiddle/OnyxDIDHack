import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
function Header() {
    const router = useRouter();
    const handleHome = () => {
        router.push('/');
    };
    const handleLogin = () => {
        router.push('/sign-up');
    };

    return (
        <header className="header">
            <div className="logo-container">
                <Image src="/seamless-header.png" alt="Seamless Logo" width={182} height={52} onClick={handleHome} />
            </div>
            <nav className="navbar">
                <Link href="https://github.com/acrylicfiddle/OnyxDIDHack" className='nav-link'>
                    Documentation
                </Link>
                <button className="login-home-button" onClick={handleLogin}>Login</button>
            </nav>
        </header>
    );
}

export default Header;
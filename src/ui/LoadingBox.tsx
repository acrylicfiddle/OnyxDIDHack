import Spinner from '@/ui/Spinner';
import Button from '@/ui/Button';
interface LoadingBoxProps {
    login: () => void;
}
  
export const LoadingBox: React.FC<LoadingBoxProps> = ({ login }) => {
    return (
        <div className='loading-container'>
        <Spinner />
        <Button onClick={login}>Logout</Button>
        </div>
    );
}
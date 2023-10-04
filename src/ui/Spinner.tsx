import Image from 'next/image'

const Spinner = () => (
  <div className='flex items-center justify-center bg-transparent'>
    <Image src='/spinner.gif' alt='spinner' width={50} height={50} />
  </div>
)

export default Spinner

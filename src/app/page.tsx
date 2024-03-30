import QrCodeScanner from './components/QrReader'
import { NextPage } from 'next'
import { QRCodeSVG } from 'qrcode.react'
import QrReaderImage from './components/QrReaderImage'

const Home: NextPage = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-start p-32'>
      <p className='mt-8 text-center text-sm text-gray-500'>QRコードをスキャン</p>
      <div className='bg-white mt-8 p-4 rounded-md'>
        <QrCodeScanner />
      </div>
      {/* <p className='mt-8 text-center text-sm text-gray-500'>QRコードをスキャン</p>
      <div className='bg-white p-4 rounded-md'>
        <QrReaderImage />
      </div> */}
    </main>
  )
}
export default Home
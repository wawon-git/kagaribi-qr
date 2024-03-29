'use client'
import jsQR from 'jsqr'
import Link from 'next/link'
import { FC, useState } from 'react'
import { useDropzone } from 'react-dropzone'

type Props = {}
const QrReaderImage: FC<Props> = () => {
    const [result, setResult] = useState<string | undefined>()
    const [error, setError] = useState<string | undefined>()

    const onDrop = async (files: File[]) => {
        if (files.length < 1) return setError('ファイルを選択されます')
        const file = files[0]
        // 画像の判定
        if (!file.type.includes('image')) return setError('画像じゃありません')
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (!e.target) return
                const img = new Image()
                img.onload = () => {
                    // キャンバス作成
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        // キャンバスに画像を描画
                        ctx.drawImage(img, 0, 0)
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        // QRコードをスキャン
                        const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height)
                        if (!qrCodeData) {
                            setResult(undefined)
                            setError('QRコードを読み込めませんでした')
                            return
                        }
                        // スキャンされた内容の確認
                        if (qrCodeData.data !== 'http://localhost:3000/result') {
                            setResult(undefined)
                            setError('対応していないQRコードです')
                            return
                        }

                        setResult(qrCodeData.data)
                    }
                }
                img.src = e.target.result as string
            }
            reader.readAsDataURL(file)
        }
    }
    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false })

    return (
        <>
            {!result && (
                <div className='h-72 w-72 bg-white rounded-sm border border-dashed border-gray-600' {...getRootProps()}>
                    <input {...getInputProps()} />
                    {error && <p className='text-center text-xs text-red-500'>{error}</p>}
                </div>
            )}
            {result && (
                <div className='flex justify-center text-black'>
                    {' '}
                    <Link href={result}>
                        <button>push</button>
                    </Link>
                </div>
            )}
        </>
    )
}

export default QrReaderImage
'use client'
import jsQR from 'jsqr'
import React, { useRef, useState, useEffect, FC } from 'react'

type Props = {}
const QrCodeScanner: FC<Props> = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [result, setResult] = useState('')
    const [parsedResult, setParsedResult] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 300 },
                height: { ideal: 300 },
            },
        }

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                    scanQrCode()
                }
            })
            .catch((err) => console.error('Error accessing media devices:', err))

        const currentVideoRef = videoRef.current

        return () => {
            if (currentVideoRef && currentVideoRef.srcObject) {
                const stream = currentVideoRef.srcObject as MediaStream
                const tracks = stream.getTracks()
                tracks.forEach((track) => track.stop())
            }
        }
    }, [])

    const scanQrCode = () => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (canvas && video) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height)
                if (qrCodeData) {
                    setResult(qrCodeData.data)
                    const participantId = parseParticipantIdFromUrl(qrCodeData.data)
                    setParsedResult(participantId)
                    return
                }
                setTimeout(scanQrCode, 100)
            }
        }
    }

    // URLからparticipant IDを抽出する関数
    const parseParticipantIdFromUrl = (url: string): string => {
        const match = url.match(/participant\/(\d+)/)
        return match ? match[1] : 'IDが見つかりません'
    }

    return (
        <div>
            {!result && (
                <div className='flex justify-center'>
                    <div className='relative h-[300px] w-[300px]'>
                        <video ref={videoRef} autoPlay playsInline className='absolute left-0 top-0 -z-50 h-[300px] w-[300px]' />
                        <canvas ref={canvasRef} width='300' height='300' className='absolute left-0 top-0' />
                    </div>
                </div>
            )}
            {result && (
                <div className='flex justify-center'>
                    <p className='text-center'>Participant ID: {parsedResult}</p>
                </div>
            )}
            {error && <p className='text-center text-xs text-red-500'>{error}</p>}
        </div>
    )
}

export default QrCodeScanner
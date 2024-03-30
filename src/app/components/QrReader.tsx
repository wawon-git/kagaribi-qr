// kagaribi-qr/src/app/components/QrReader.tsx
'use client'
import React, { useRef, useState, useEffect, FC } from 'react';
import jsQR from 'jsqr';
import { fetchSpreadsheetData } from './actions/fetchSpreadsheetData';

const QrCodeScanner: FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [result, setResult] = useState<string | null>(null);
    const [parsedResult, setParsedResult] = useState<string | null>(null);
    const [participantData, setParticipantData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanned, setIsScanned] = useState(false);

    useEffect(() => {
        const startVideo = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        requestAnimationFrame(scanQrCode); // スキャン開始
                    }
                } catch (err) {
                    setError('Error accessing the camera');
                }
            }
        };
        startVideo();
    }, []);

    const scanQrCode = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });
                if (code) {
                    console.log('QR Code detected:', code.data);
                    setResult(code.data);
                    const participantId = parseParticipantIdFromUrl(code.data);
                    console.log('Parsed Participant ID:', participantId);
                    setParsedResult(participantId);
                    setIsScanned(true);
                } else {
                    requestAnimationFrame(scanQrCode); // 継続してスキャン
                }
            }
        }
    };

    const handleRescan = () => {
        setIsScanned(false);
        setResult(null);
        setParsedResult(null);
        setParticipantData(null);
        setError(null);
        requestAnimationFrame(scanQrCode);
    };

    const parseParticipantIdFromUrl = (url: string): string | null => {
        const match = url.match(/\/participant\/(\d+)\/qr/);
        return match ? match[1] : null;
    }

    useEffect(() => {
        if (parsedResult) {
            (async () => {
                try {
                    const data = await fetchSpreadsheetData(parsedResult)
                    setParticipantData(data)
                } catch (error) {
                    setError('Failed to fetch participant data')
                }
            })()
        }
    }, [parsedResult]);

    // participantDataを整形して表示する関数
    const renderParticipantData = (data: any) => {
        if (!data) return null;
        // ここでdataの形式に応じて必要な情報を抽出し、整形します。
        // 例: 名前とメールアドレスのみを表示する場合
        return (
            <div className='mt-4 p-4 bg-gray-100 rounded'>
                {Object.keys(data).map((key) => (
                    <p key={key}><strong>{key}:</strong> {data[key]}</p>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className='flex justify-center'>
                <div className='relative h-[300px] w-[300px]'>
                    <video ref={videoRef} autoPlay playsInline className='absolute left-0 top-0 -z-50 h-[300px] w-[300px]' />
                    <canvas ref={canvasRef} width='300' height='300' className='absolute left-0 top-0' />
                </div>
            </div>
            {/* participantDataが存在する場合、整形して表示 */}
            {participantData && renderParticipantData(participantData)}
            {/* エラーメッセージが存在する場合、表示 */}
            {error && (
                <div className='text-red-500 mt-4'>
                    {error}
                </div>
            )}
            {/* データが描画されるまたはエラーが表示される時に再スキャンボタンを表示 */}
            {(participantData || error) && (
                <div className='flex justify-center mt-4'>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                        onClick={handleRescan}>再スキャン</button>
                </div>
            )}
        </div>
    );
}

export default QrCodeScanner;
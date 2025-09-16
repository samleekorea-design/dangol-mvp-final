'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'

export default function InstallQRPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    // Generate QR code for the install page
    QRCode.toDataURL('https://dangol.site/install', {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    .then(url => {
      setQrCodeUrl(url)
    })
    .catch(err => {
      console.error('Error generating QR code:', err)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 print:p-0">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/images/logo-blue.png"
            alt="DANGOL"
            width={120}
            height={40}
            className="mx-auto"
          />
        </div>
        
        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-white p-8 rounded-lg shadow-lg print:shadow-none">
            <img 
              src={qrCodeUrl} 
              alt="DANGOL Install QR Code" 
              className="w-full max-w-md mx-auto"
            />
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-8 space-y-4 text-gray-700">
          <p className="text-2xl font-semibold">스마트폰으로 QR코드를 스캔하세요</p>
          <p className="text-lg">단골 앱을 설치하고 특별한 혜택을 받아보세요!</p>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              문의: KakaoTalk @dangol_local
            </p>
          </div>
        </div>

        {/* Print button (hidden when printing) */}
        <button
          onClick={() => window.print()}
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 print:hidden"
        >
          인쇄하기
        </button>
      </div>
    </div>
  )
}

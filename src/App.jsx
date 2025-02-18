import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { defineComponents, DocumentReaderService } from '@regulaforensics/vp-frontend-document-components';

function App() {
  const [count, setCount] = useState(0)
  const documentReaderElementRef = useRef(null);
  const cameraSnapshotElementRef = useRef(null);

  useEffect(() => {
    if (documentReaderElementRef.current) {
      documentReaderElementRef.current.settings = {
        locale: 'en',
        captureButton: true,
        mirrorButton: true,
        startScreen: true,
      };
    }

    if (cameraSnapshotElementRef.current) {
      cameraSnapshotElementRef.current.settings = {
        locale: 'en',
        captureButton: true,
        mirrorButton: true,
        startScreen: true
      };
    }
  }, []);


  window.RegulaDocumentSDK = new DocumentReaderService();

  window.RegulaDocumentSDK.recognizerProcessParam = {
    processParam: {
      scenario: 'MrzAndLocate',
      returnUncroppedImage: true,
      multipageProcessing: false,
      returnPackageForReprocess: false,
      timeout: 20000,
      resultTypeOutput: [17, 37, 102, 103, 20, 9, 6, 5, 3, 1, 19],
      imageQa: {
        expectedPass: ['dpiThreshold', 'glaresCheck', 'focusCheck'],
        dpiThreshold: 130,
        glaresCheck: true,
        glaresCheckParams: {
          imgMarginPart: 0.05,
          maxGlaringPart: 0.01,
        },
      },
    },
  };
  window.RegulaDocumentSDK.imageProcessParam = {
    processParam: {
      scenario: 'MrzAndLocate',
      returnUncroppedImage: true,
      returnPackageForReprocess: false,
    },
  };

  defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAESFb1zjjaK+vbgfIIMKIwS+TGmvhsrpUuTNCaVjY2smJc2gOCulmK6nbgHDdvGDpEqvmPgPsM25/I50yKCdx4jWcE25onpznjPPoBdSZ4chG1OJV2StGnbe6MG+N250ofonnCg7ATsRujSYUCqI6OjR8c/nNbKv+iC2ASWWos3Js8Q3Pubt4PX+shLquv6d0wB/Cev2TASe+DlxGtddgrCZl+lFaKCvMrmkK5nrui57QVZbYR4SaHBrN9eTnGPAZVejJukDsdOnPizrZVbmP7UlHtZL5GmylMk7hT5NgRgIjoMU1gGirknFsmU1kAZMIat1WIIgLxg+8O529w2twW/kAAAAAAAAEPMvAhWSzHtZK9PpKm0moMzQ9TXkWqkb3yTfqyAHy2jb56yiYz1QuR6bQo0PfMJ9AQM9h2wBsjlGg7ywf6sx8NagesbJk2Q38JAgMH5lnSd3nnDqXDjmRzdRQ5qHD58E1f4CEMi5qB09NXLswZ4GCyUjRDrPwLXrdaJdpyPw4xtzlZNlTctsUwSEfcHRTiDa6oDBF3Nu2Jh7ipBy1us59R3yhrZRsSyKI7+120CxPu3hBpmDpf2PLydOVqpx8J6ajl7k1xT5h90xZiY+VctAAww4riomV+6XmP4k1o4PWtas' }));

  return (
    <>
      <div className="regula-container">
        <h2>Document Reader</h2>
        <document-reader ref={documentReaderElementRef}></document-reader>
        <h2>Camera Snapshot</h2>
        <camera-snapshot ref={cameraSnapshotElementRef}></camera-snapshot>
      </div>
    </>
  )
}

export default App

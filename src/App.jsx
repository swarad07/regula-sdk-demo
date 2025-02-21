import { useState, useEffect, useRef, React } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { defineComponents, DocumentReaderService } from '@regulaforensics/vp-frontend-document-components';
import '@regulaforensics/vp-frontend-face-components';
import { converBase64ToImage } from 'convert-base64-to-image';

const buttonStyle = {
  padding: '10px 30px',
  color: 'white',
  fontSize: '16px',
  borderRadius: '2px',
  backgroundColor: '#bd7dff',
  border: '1px solid #bd7dff',
  cursor: 'pointer'
};

function App() {
  const [count, setCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const documentReaderElementRef = useRef(null);
  const cameraSnapshotElementRef = useRef(null);
  const faceCaptureElementRef = useRef(null);
  const faceLivenessElementRef = useRef(null);
  const [locale, setLocale] = useState('en');

  const getLocaleOptions = () => {
    const locales = ['en', 'es', 'zh-Hans', 'ja', 'ko'];
    return locales.map((locale) => (
      <option key={locale} value={locale}>
        {locale}
      </option>
    ));
  };

  useEffect(() => {
    console.log(locale);
    if (documentReaderElementRef.current) {
      documentReaderElementRef.current.settings = {
        locale: locale,
        captureButton: true,
        mirrorButton: true,
        startScreen: true,
      };
    }

    if (cameraSnapshotElementRef.current) {
      cameraSnapshotElementRef.current.settings = {
        locale: locale,
        captureButton: true,
        mirrorButton: true,
        startScreen: true
      };
    }

    if (faceCaptureElementRef.current) {
      faceCaptureElementRef.current.settings = {
        locale: locale,
        copyright: true,
        changeCamera: true,
        startScreen: true,
        closeDisabled: true,
        finishScreen: true,
        retryCount: 3,
      };
    }

    if (faceLivenessElementRef.current) {
      faceLivenessElementRef.current.settings = {
        locale: locale,
        copyright: true,
        changeCamera: true,
        startScreen: true,
        closeDisabled: true,
        finishScreen: true,
        retryCount: 3,
      };
    }

    // Document Reader
    const regulaContainer = document.querySelector('.regula-container');
    regulaContainer.addEventListener('document-reader', documentReaderListener);

    // Face Capture
    const faceCaptureComponent = document.querySelector('.face-capture-container');
    faceCaptureComponent.addEventListener('face-capture', faceCaptureListener);

    // Face Liveness
    const faceLivenessComponent = document.querySelector('.face-liveness-container');
    faceLivenessComponent.addEventListener('face-liveness', faceLivenessListener);

  }, [locale]);

  function faceCaptureListener(data) {
    console.log(data);
    console.log(data.detail.action)
    if (data.detail.action === 'PROCESS_FINISHED') {
      const response = data.detail.data.response;
      console.log(response);
      const rawImage = 'data:image/jpeg;base64,' + response.capture[0];
      console.log(rawImage)
    }

    if (data.detail?.action === 'CLOSE') {
      setIsOpen(false);
    }
    // if (data.detail.action === 'PROCESS_FINISHED') {
    //     if (data.detail.data?.status === 1 && data.detail.data.response) {
    //         console.log(data.detail.data.response);
    //     }
    // }
    // if (data.detail?.action === 'CLOSE') {
    //     const faceCapture = document.querySelector('face-capture');

    //     if (faceCapture) {
    //         faceCapture.remove();
    //     }
    // }
  }

  function faceLivenessListener(data) {
    console.log(data);
    console.log(data.detail.action)
    if (data.detail.action === 'PROCESS_FINISHED') {
      const response = data.detail.data.response;
      const rawImage = 'data:image/jpeg;base64,' + response.images[0];
      console.log(rawImage)
      console.log('Face Liveness Process Finished with status ' + data.detail.data.status);
    }

    if (data.detail?.action === 'CLOSE') {
      setIsOpen2(false);
    }

    // if (data.detail.action === 'PROCESS_FINISHED') {
    //     if (data.detail.data?.status === 1 && data.detail.data.response) {
    //         console.log(data.detail.data.response);
    //     }
    // }
    // if (data.detail?.action === 'CLOSE') {
    //     const faceLiveness = document.querySelector('face-liveness');

    //     if (faceLiveness) {
    //         faceLiveness.remove();
    //     }
    // }
  }

  function documentReaderListener(data) {
    console.log(data.detail.action);
    if (data.detail.action === 'PROCESS_FINISHED') {
        console.log(data.detail.data);

        // const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//'
        const pathToSaveImage = './public/'+ data.detail.data.response.TransactionInfo.TransactionID + '.png';
        const rawImage = 'data:image/jpeg;base64,' + data.detail.data?.response?.images?.fieldList[0].valueList[0].value;
        console.log(rawImage)
        // const path = converBase64ToImage(rawImage, pathToSaveImage);
        //console.log(path);

        const status = data.detail.data?.status;
        const isFinishStatus = status === 1 || status === 2;

        if (!isFinishStatus || !data.detail.data?.response) return;

        window.RegulaDocumentSDK.finalizePackage();
    }
    if (data.detail?.action === 'CLOSE') {
        const reader = document.querySelector('document-reader');

        if (reader) {
            reader.remove();
        }

        button.style.display = 'block';
    }
  }


  window.RegulaDocumentSDK = new DocumentReaderService();

  window.RegulaDocumentSDK.recognizerProcessParam = {
    processParam: {
      backendProcessing: {
        serviceURL: 'http://localhost:8080',
      },
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

  const updateLocale = (e) => {
    setLocale(e.target.value);
  };

  return (
    <>
      <div className="locale-options">
        <h2>Locale Options</h2>
          <label htmlFor="locale">Locale</label>
          <select id="locale" onChange={(e) => updateLocale(e)}>
            {getLocaleOptions()}
          </select>
      </div>
      <div className="regula-container">
        <h2>Document Reader</h2>
        <document-reader ref={documentReaderElementRef} ></document-reader>
        {/* <h2>Camera Snapshot</h2> */}
        {/* <camera-snapshot ref={cameraSnapshotElementRef}></camera-snapshot> */}
      </div>
      <div className="regula-face-container">
        <h2>Face Capture</h2>


        <div className="face-capture-container">
            {isOpen ? (
                <face-capture ref={faceCaptureElementRef}></face-capture>
            ) : (
                <button style={buttonStyle} onClick={() => setIsOpen(true)}>Open Face Capture</button>
            )}
        </div>

        <h2>Face Liveliness</h2>

        <div className="face-liveness-container">
            {isOpen2 ? (
                <face-liveness ref={faceLivenessElementRef}></face-liveness>
            ) : (
                <button style={buttonStyle} onClick={() => setIsOpen2(true)}>Open Face Liveliness check</button>
            )}
        </div>
      </div>
    </>
  )
}

export default App

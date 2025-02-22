import { useState, useEffect, useRef, React } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { defineComponents, DocumentReaderService } from '@regulaforensics/vp-frontend-document-components';
import '@regulaforensics/vp-frontend-face-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiamond } from '@fortawesome/free-solid-svg-icons';

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
  const [documentReaderResponse, setDocumentReaderResponse] = useState(null);
  const [faceLivenessResponse, setFaceLivenessResponse] = useState(null);
  const [locale, setLocale] = useState('en');

  /**
   * Get locale options
   */
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

  }, [locale, documentReaderResponse, faceLivenessResponse]);

  /**
   * Face Capture Listener
   */
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
  }

  /**
   * Face Liveness Listener
   */
  function faceLivenessListener(data) {
    if (data.detail.action === 'PROCESS_FINISHED') {
      console.log(data.detail.data);
      setFaceLivenessResponse(data.detail.data);
      // const response = data.detail.data.response;
      // const rawImage = 'data:image/jpeg;base64,' + response.images[0];
      // console.log(rawImage)
      // console.log('Face Liveness Process Finished with status ' + data.detail.data.status);
    }

    if (data.detail?.action === 'CLOSE') {
      setIsOpen2(false);
    }
  }

  const generateFaceLivenessResponseMarkup = (data) => {
    if (!data) return;
    const { code, estimatedAge, status, images } = data.response;
    return (
      <>
        <div className="row">
          <h4>Code</h4>
          <p>{code}</p>
        </div>
        <div className="row">
          <h4>Estimated Age</h4>
          <p>{estimatedAge}</p>
        </div>
        <div className="row">
          <h4>Status</h4>
          <p>{status}</p>
        </div>
        <div className="row">
          <h4>Image</h4>
          <p><img src={generateImg(images[0])} alt="Face Liveness" /></p>
        </div>
      </>
    );
  };

  /**
   * Generate complete image base64 string
   */
  const generateImg = (base64) => {
    return 'data:image/jpeg;base64,' + base64;
  };

  /**
   * Generate text fields markup
   */
  const generateTextFields = (fields) => {
    if (!fields) return;
    const textFields = fields.map((field, index) => {
      return (
        <div className="row" key={index}>
          <h4><FontAwesomeIcon icon={faDiamond} />{field.fieldName}</h4>
          <p>{field.value}</p>
        </div>
      );
    });

    return textFields;
  };

  /**
   * Generate Image fields markup
   */
  const generateImageFields = (fields) => {
    if (!fields) return;
    const imageFields = fields.map((field, index) => {
      return (
        <div className="row" key={index}>
          <h4><FontAwesomeIcon icon={faDiamond} />{field.fieldName}</h4>
          <img src={generateImg(field.valueList[0].value)} alt={field.fieldName} />
        </div>
      );
    });

    console.log(imageFields);

    return imageFields;
  };

  /**
   * Document Reader Listener
   */
  function documentReaderListener(data) {
    console.log(data.detail.action);
    if (data.detail.action === 'PROCESS_FINISHED') {
        console.log(data.detail.data);
        setDocumentReaderResponse(data.detail.data);
        const pathToSaveImage = './public/'+ data.detail.data.response.TransactionInfo.TransactionID + '.png';
        const img = generateImg(data.detail.data?.response?.images?.fieldList[0].valueList[0].value);

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

  // Regula Document SDK
  window.RegulaDocumentSDK = new DocumentReaderService();

  // Recognizer Process Param
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
      // resultTypeOutput: [20],
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

  // Image Process Param
  window.RegulaDocumentSDK.imageProcessParam = {
    processParam: {
      scenario: 'MrzAndLocate',
      returnUncroppedImage: true,
      returnPackageForReprocess: false,
    },
  };

  // Initialize Regula Document SDK
  defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: import.meta.env.VITE_REACT_APP_REGULA_LICENSE }));

  return (
    <>
      <div className="locale-options">
        <h2>Locale Options</h2>
          <label htmlFor="locale">Locale</label>
          <select id="locale" onChange={(e) => setLocale(e.target.value)}>
            {getLocaleOptions()}
          </select>
      </div>
      <div className="regula-container">
        <h2><span className="numbers">1</span>Document Reader</h2>
        <document-reader ref={documentReaderElementRef} ></document-reader>
        {/* <h2>Camera Snapshot</h2> */}
        {/* <camera-snapshot ref={cameraSnapshotElementRef}></camera-snapshot> */}
      </div>
      <div className="regula-face-container">
        <h2><span className="numbers">2</span>Face Liveliness</h2>
        <div className="face-liveness-container">
            {isOpen2 ? (
                <face-liveness ref={faceLivenessElementRef}></face-liveness>
            ) : (
                <button style={buttonStyle} onClick={() => setIsOpen2(true)}>Open Face Liveliness check</button>
            )}
        </div>
        <h2><span className="numbers">3</span>Face Capture</h2>
        <div className="face-capture-container">
          {isOpen ? (
              <face-capture ref={faceCaptureElementRef}></face-capture>
          ) : (
              <button style={buttonStyle} onClick={() => setIsOpen(true)}>Open Face Capture</button>
          )}
        </div>
      </div>
      <div className="regula-response">
        <h2>Response Logs</h2>
        <div className="response-text-fields">
          <h3>Document Reader Text fields</h3>
          {generateTextFields(documentReaderResponse?.response?.text?.fieldList)}
        </div>
        <div className="response-image-fields">
          <h3>Document Reader Image fields</h3>
          {generateImageFields(documentReaderResponse?.response?.images?.fieldList)}
        </div>
        <div className="face-liveness-response">
          <h3>Face Liveness Response</h3>
          {generateFaceLivenessResponseMarkup(faceLivenessResponse)}
        </div>
      </div>
    </>
  )
}

export default App

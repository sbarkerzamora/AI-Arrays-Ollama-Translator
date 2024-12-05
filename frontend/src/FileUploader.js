import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Conectar al socket en el puerto 5001
const socket = io('http://localhost:5001');

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      setLog((prevLog) => prevLog + '\n' + 'No se ha seleccionado ningún archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:5001/translate', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Error en el servidor.');
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setLog((prevLog) => prevLog + '\n' + data.error);
        } else {
          setLog((prevLog) => prevLog + '\n' + data.message);
          setProgress(100);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLog((prevLog) => prevLog + '\n' + error.message);
      });
  };

  useEffect(() => {
    socket.on('progress', (data) => {
      setProgress(data.progress);
    });

    socket.on('log', (data) => {
      setLog((prevLog) => prevLog + '\n' + data.message);
    });

    return () => {
      socket.off('progress');
      socket.off('log');
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div
        className="border-dashed border-4 border-gray-300 rounded-md p-4 cursor-pointer text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {file ? (
          <p className="text-gray-700">{file.name}</p>
        ) : (
          <p className="text-gray-500">
            Arrastra y suelta el archivo PHP aquí o haz clic para seleccionar
          </p>
        )}
        <input
          type="file"
          id="fileInput"
          accept=".php"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
      {file && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleUpload}
        >
          Traducir
        </button>
      )}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-width duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      <div className="mt-4 bg-black text-green-500 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
        <pre>{log}</pre>
      </div>
    </div>
  );
};

export default FileUploader;

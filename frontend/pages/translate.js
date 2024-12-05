import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUp, Upload } from 'lucide-react'

export default function Translate() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.php')) {
      setFile(selectedFile);
    } else {
      setMessage('Por favor, selecciona un archivo PHP válido.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor, selecciona un archivo");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5001/translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentage);
        }
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage('Error al realizar la traducción.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileUp className="w-6 h-6" />
            Traductor de Archivos PHP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".php"
              className="flex-1"
            />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              Traducir
            </Button>
          </div>
          
          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 text-right">{progress}%</p>
            </div>
          )}
          
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Sube un archivo PHP para traducirlo automáticamente.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


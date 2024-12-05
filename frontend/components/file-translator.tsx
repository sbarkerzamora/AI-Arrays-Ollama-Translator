"use client"

import * as React from "react"
import { FileUp, Upload, X } from 'lucide-react'
import { io, Socket } from "socket.io-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

const socket: Socket = io('http://localhost:5001')

export function FileTranslator() {
  const [file, setFile] = React.useState<File | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState<string>("")
  const [isDragging, setIsDragging] = React.useState(false)
  const [logs, setLogs] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const logRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    socket.on('progress', (data: { progress: number }) => {
      setProgress(data.progress)
    })

    socket.on('log', (data: { message: string }) => {
      setLogs(prev => [...prev, data.message])
    })

    return () => {
      socket.off('progress')
      socket.off('log')
    }
  }, [])

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.name.endsWith('.php')) {
      setFile(droppedFile)
    } else {
      setStatus('Por favor, selecciona un archivo PHP válido.')
    }
  }, [])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile?.name.endsWith('.php')) {
      setFile(selectedFile)
    } else {
      setStatus('Por favor, selecciona un archivo PHP válido.')
    }
  }, [])

  const handleTranslate = React.useCallback(async () => {
    if (!file) {
      setStatus('Por favor, selecciona un archivo primero.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setStatus('Iniciando traducción...')
      setProgress(0)
      setLogs([])

      const response = await fetch('http://localhost:5001/translate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error en el servidor')
      }

      const data = await response.json()
      setStatus(data.message || 'Traducción completada con éxito')
    } catch (error) {
      setStatus('Error al procesar el archivo')
      console.error('Error:', error)
    }
  }, [file])

  const clearFile = React.useCallback(() => {
    setFile(null)
    setProgress(0)
    setStatus('')
    setLogs([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Traductor de Archivos PHP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            file ? "bg-muted/50" : "hover:bg-muted/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arrastra y suelta el archivo PHP aquí o haz clic para seleccionar
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".php"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-right">{progress}%</p>
          </div>
        )}

        {status && (
          <Alert>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[200px] w-full rounded-md border bg-black p-4" ref={logRef}>
          <div className="font-mono text-sm">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="text-green-500 animate-fade-in-down"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  textShadow: '0 0 5px #00ff00'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button 
          className="w-full" 
          onClick={handleTranslate}
          disabled={!file}
        >
          <Upload className="h-4 w-4 mr-2" />
          Traducir Archivo
        </Button>
      </CardContent>
    </Card>
  )
}


import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { UploadCloud, FileText, X, AlertCircle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export const UploadPage = () => {
  const { getClient } = useApi();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'upload' | 'ocr' | 'itinerary'>('upload');
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Mime types allowed on client side
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (selectedFiles: FileList) => {
    setGeneralError(null);
    const validStates: FileUploadState[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // Size check
      if (file.size > MAX_SIZE) {
        setGeneralError(`File "${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      // Type check
      if (!ALLOWED_TYPES.includes(file.type)) {
        setGeneralError(`File "${file.name}" has an unsupported format. Only PDF, JPG, PNG are allowed.`);
        return;
      }

      // Check if duplicate
      if (files.some((f) => f.file.name === file.name && f.file.size === file.size)) {
        return;
      }

      validStates.push({
        file,
        progress: 0,
        status: 'idle',
      });
    });

    setFiles((prev) => [...prev, ...validStates]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const startPipeline = async () => {
    if (files.length === 0) {
      setGeneralError('Please add at least one travel document.');
      return;
    }

    try {
      setProcessing(true);
      setGeneralError(null);

      // --- PHASE 1: UPLOAD FILES ---
      setProcessingStep('upload');
      
      const formData = new FormData();
      files.forEach((fileState) => {
        formData.append('files', fileState.file);
      });

      // Update upload statuses to 'uploading'
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'uploading', progress: 20 }))
      );

      const client = await getClient(true);
      const uploadRes = await client.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles((prev) =>
              prev.map((f) => ({ ...f, progress: percentage }))
            );
          }
        },
      });

      const uploadedFiles = uploadRes.data.data.files as { id: string }[];
      const fileIds = uploadedFiles.map((f) => f.id);

      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'completed', progress: 100 }))
      );

      // --- PHASE 2: EXTRACTING / OCR ---
      setProcessingStep('ocr');
      // Adding brief visual pause for OCR transition
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // --- PHASE 3: GEMINI ITINERARY GENERATION ---
      setProcessingStep('itinerary');
      const api = await getClient();
      const itineraryRes = await api.post('/api/itinerary/generate', { fileIds });

      const trip = itineraryRes.data.data.trip;
      
      // Navigate to detailed trip view
      navigate(`/trip/${trip._id}`);
    } catch (err: any) {
      console.error('Itinerary generation error:', err);
      setProcessing(false);
      
      const apiErrMessage = err.response?.data?.message || 'Itinerary generation failed. Please try again.';
      setGeneralError(apiErrMessage);
      
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'failed', error: 'Pipeline failed' }))
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-slate-950 text-white min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Upload Travel Documents
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Provide flight booking tickets, boarding passes, or hotel receipts. Supported formats: PDF, JPG, JPEG, PNG.
          </p>
        </div>

        {/* Error Notification */}
        {generalError && (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 flex items-start space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Upload Issue</p>
              <p className="text-xs mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        {/* Drag & Drop Canvas */}
        {!processing && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative ${
              dragActive
                ? 'border-primary-500 bg-primary-950/10'
                : 'border-slate-800 bg-slate-900/10 hover:border-slate-700'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-premium">
                <UploadCloud className="w-8 h-8 text-primary-400" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Drag & drop your files here</p>
                <p className="text-slate-550 text-xs">or click to browse from files</p>
              </div>
              <p className="text-[10px] text-slate-500">Max size 10MB per file</p>
            </div>
          </div>
        )}

        {/* Selected Files & Progress */}
        {files.length > 0 && !processing && (
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-350">Selected Booking Files</h3>
            <div className="space-y-3">
              {files.map((fileState, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-primary-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                        {fileState.file.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {(fileState.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded-lg hover:bg-slate-850 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={startPipeline}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-sky-500 rounded-xl font-bold shadow-premium hover:shadow-premium-hover transition-all text-sm flex items-center justify-center space-x-2 text-white"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Travel Itinerary</span>
            </button>
          </div>
        )}

        {/* Processing/Loading Screen */}
        {processing && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-8 text-center space-y-8 shadow-premium">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              
              <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Gemini Travel Engine Processing</h3>
              <p className="text-slate-450 text-xs max-w-sm mx-auto leading-relaxed">
                We are processing your documents. Please do not close this window or navigate away.
              </p>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="max-w-md mx-auto border-t border-slate-850 pt-6 space-y-4 text-left text-xs">
              
              {/* Step 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    processingStep === 'upload'
                      ? 'border-primary-500 text-primary-400 bg-primary-950/20'
                      : 'border-slate-800 text-slate-500 bg-slate-950'
                  }`}>
                    {processingStep !== 'upload' ? <CheckCircle2 className="w-4 h-4 text-primary-450" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  </div>
                  <span className={processingStep === 'upload' ? 'text-white font-semibold' : 'text-slate-450'}>
                    Uploading booking receipts to Cloudinary
                  </span>
                </div>
                {processingStep !== 'upload' && <span className="text-[10px] text-primary-400 font-semibold">Done</span>}
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    processingStep === 'ocr'
                      ? 'border-primary-500 text-primary-400 bg-primary-950/20'
                      : processingStep === 'itinerary'
                      ? 'border-emerald-500 text-emerald-500 bg-emerald-950/10'
                      : 'border-slate-800 text-slate-500 bg-slate-950'
                  }`}>
                    {processingStep === 'itinerary' ? (
                      <CheckCircle2 className="w-4 h-4 text-primary-450" />
                    ) : processingStep === 'ocr' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className={processingStep === 'ocr' ? 'text-white font-semibold' : 'text-slate-450'}>
                    Extracting travel records & running OCR
                  </span>
                </div>
                {processingStep === 'itinerary' && <span className="text-[10px] text-primary-400 font-semibold">Done</span>}
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    processingStep === 'itinerary'
                      ? 'border-primary-500 text-primary-400 bg-primary-950/20'
                      : 'border-slate-800 text-slate-500 bg-slate-950'
                  }`}>
                    {processingStep === 'itinerary' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>3</span>}
                  </div>
                  <span className={processingStep === 'itinerary' ? 'text-white font-semibold' : 'text-slate-450'}>
                    Generating detailed timeline with Gemini AI
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadPage;

import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

export function FileUpload({ onFilesSelected, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f: File) => f.name.endsWith('.xml') || f.name.endsWith('.zip') || f.name.endsWith('.gz')
      ) as File[];
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(
        (f: File) => f.name.endsWith('.xml') || f.name.endsWith('.zip') || f.name.endsWith('.gz')
      ) as File[];
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 border border-dashed rounded transition-colors duration-200 ease-in-out cursor-pointer overflow-hidden",
          isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept=".xml,.zip,.gz"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 text-center sm:text-left space-y-2 sm:space-y-0">
          <div className="flex items-center justify-center shrink-0 w-10 h-10 bg-white rounded border border-slate-200 shadow-sm">
            <Upload className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              {isLoading ? 'Processing...' : 'Upload XML / ZIP / GZ'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Drag & drop or click to select files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

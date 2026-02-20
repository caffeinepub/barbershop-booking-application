import { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoUploadStepProps {
  onPhotoSelected: (file: File, preview: string) => void;
  onRemovePhoto: () => void;
  currentPhoto: File | null;
  currentPreview: string;
}

export default function PhotoUploadStep({
  onPhotoSelected,
  onRemovePhoto,
  currentPhoto,
  currentPreview,
}: PhotoUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG or PNG)');
      return false;
    }
    
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Only JPEG and PNG formats are supported');
      return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }
    
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoSelected(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Upload Your Photo</h3>
        <p className="text-sm text-muted-foreground">
          Get personalized hairstyle recommendations based on your current look
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentPhoto && currentPreview ? (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <img
                src={currentPreview}
                alt="Uploaded photo"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={onRemovePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              <p className="font-medium">{currentPhoto.name}</p>
              <p>{(currentPhoto.size / 1024).toFixed(2)} KB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drag and drop your photo here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG and PNG (max 5MB)
              </p>
            </div>
            <label htmlFor="photo-upload">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium">Tips for best results:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use a clear, well-lit photo of your face</li>
          <li>Face the camera directly</li>
          <li>Avoid filters or heavy editing</li>
          <li>Show your current hairstyle clearly</li>
        </ul>
      </div>
    </div>
  );
}

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, RotateCcw, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageToggle from '@/components/LanguageToggle';

interface PhotoGridProps {}

interface ImageSlot {
  id: number;
  file: File | null;
  preview: string | null;
}

const PhotoGrid: React.FC<PhotoGridProps> = () => {
  const [images, setImages] = useState<ImageSlot[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, file: null, preview: null }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = useCallback((files: FileList, slotId?: number) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    // Filter for image files
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: t("fileFormatError"),
        description: t("fileFormatErrorDesc"),
        variant: "destructive"
      });
      return;
    }

    // If specific slot is provided, use it; otherwise find first empty slot
    let startIndex = slotId !== undefined ? slotId : images.findIndex(img => img.file === null);
    
    if (startIndex === -1) {
      toast({
        title: t("gridFull"),
        description: t("gridFullDesc"),
        variant: "destructive"
      });
      return;
    }

    const newImages = [...images];
    
    imageFiles.forEach((file, index) => {
      const targetIndex = startIndex + index;
      if (targetIndex < 9) {
        const preview = URL.createObjectURL(file);
        newImages[targetIndex] = { id: targetIndex, file, preview };
      }
    });

    setImages(newImages);
    
    toast({
      title: t("uploadSuccess"),
      description: `${t("uploadSuccessDesc")} ${Math.min(imageFiles.length, 9 - startIndex)} ${t("uploadSuccessDesc2")}`
    });
  }, [images, toast]);

  const handleDrop = useCallback((e: React.DragEvent, slotId?: number) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverSlot(null);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files, slotId);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent, slotId?: number) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOverSlot(slotId || null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
      setDragOverSlot(null);
    }
  }, []);

  const removeImage = useCallback((slotId: number) => {
    const newImages = [...images];
    if (newImages[slotId].preview) {
      URL.revokeObjectURL(newImages[slotId].preview!);
    }
    newImages[slotId] = { id: slotId, file: null, preview: null };
    setImages(newImages);
  }, [images]);

  const resetGrid = useCallback(() => {
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages(Array.from({ length: 9 }, (_, i) => ({ id: i, file: null, preview: null })));
    toast({
      title: t("gridReset"),
      description: t("gridResetDesc")
    });
  }, [images, toast]);

  const downloadGrid = useCallback(async () => {
    const filledImages = images.filter(img => img.preview);
    
    if (filledImages.length === 0) {
      toast({
        title: t("noImages"),
        description: t("noImagesDesc"),
        variant: "destructive"
      });
      return;
    }

    // Create canvas for combining images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 3;
    const cellSize = 300;
    const gap = 10;
    canvas.width = gridSize * cellSize + (gridSize - 1) * gap;
    canvas.height = gridSize * cellSize + (gridSize - 1) * gap;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images
    const imagePromises = images.map((img, index) => {
      return new Promise<void>((resolve) => {
        if (!img.preview) {
          resolve();
          return;
        }

        const image = new Image();
        image.onload = () => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const x = col * (cellSize + gap);
          const y = row * (cellSize + gap);

          // Draw image with object-fit: cover behavior
          const aspectRatio = image.width / image.height;
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

          if (aspectRatio > 1) {
            drawHeight = cellSize;
            drawWidth = cellSize * aspectRatio;
            offsetX = -(drawWidth - cellSize) / 2;
          } else {
            drawWidth = cellSize;
            drawHeight = cellSize / aspectRatio;
            offsetY = -(drawHeight - cellSize) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, cellSize, cellSize);
          ctx.clip();
          ctx.drawImage(image, x + offsetX, y + offsetY, drawWidth, drawHeight);
          ctx.restore();
          resolve();
        };
        image.src = img.preview;
      });
    });

    await Promise.all(imagePromises);

    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `九宫格-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: t("downloadSuccess"),
          description: t("downloadSuccessDesc")
        });
      }
    }, 'image/png');
  }, [images, toast]);

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <LanguageToggle />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            {t("subtitle")}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="gradient-primary text-white shadow-glow hover:shadow-strong transition-all duration-300"
            >
              <Upload className="w-5 h-5 mr-2" />
              {t("uploadImages")}
            </Button>
            
            <Button
              onClick={downloadGrid}
              variant="outline"
              size="lg"
              className="glass border-primary/20 hover:border-primary/40"
            >
              <Download className="w-5 h-5 mr-2" />
              {t("downloadGrid")}
            </Button>
            
            <Button
              onClick={resetGrid}
              variant="outline"
              size="lg"
              className="glass border-destructive/20 hover:border-destructive/40"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t("resetGrid")}
            </Button>
          </div>
        </header>

        {/* Main Upload Zone */}
        <div
          className={`glass-card rounded-2xl p-8 mb-8 upload-zone ${
            isDragging && dragOverSlot === null ? 'drag-over' : ''
          }`}
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-float">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("dragHere")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("orClick")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("supportedFormats")}
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        <section className="glass-card rounded-2xl p-6 animate-slide-up">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {images.map((slot) => (
              <div
                key={slot.id}
                className={`aspect-square rounded-xl grid-slot relative group overflow-hidden ${
                  slot.file ? 'filled' : 'empty'
                } ${dragOverSlot === slot.id ? 'drag-over' : ''}`}
                onDrop={(e) => handleDrop(e, slot.id)}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
              >
                {slot.preview ? (
                  <>
                    <img
                      src={slot.preview}
                      alt={`${t("position")} ${slot.id + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      onClick={() => removeImage(slot.id)}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {t("position")} {slot.id + 1}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
      </div>
    </main>
  );
};

export default PhotoGrid;
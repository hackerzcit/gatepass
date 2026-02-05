import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Image from "next/image";

export interface ImageUploaderConfig {
  // Required props
  onImageUpload: (url: string) => void;

  // Button configuration
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;

  // Modal configuration
  modalTitle?: string;
  modalDescription?: string;

  // Crop configuration
  aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape, 4/3 for standard photo
  cropWidth?: number; // Initial crop width percentage (default: 80)

  // Upload configuration
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string; // e.g., "image/*", "image/jpeg,image/png"

  // Display configuration
  showPreview?: boolean;
  previewUrl?: string;
  previewClassName?: string;
  previewSize?: { width: number; height: number };

  // States
  disabled?: boolean;
}

interface ImageUploadState {
  isModalOpen: boolean;
  selectedFile: File | null;
  imagePreview: string;
  showCropInterface: boolean;
  isUploading: boolean;
  crop?: Crop;
  completedCrop?: Crop;
  imgRef?: HTMLImageElement;
}

export const ImageUploader: React.FC<ImageUploaderConfig> = ({
  onImageUpload,
  buttonText = "Upload Image",
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName = "",
  modalTitle = "Upload Image",
  modalDescription = "Select and crop your image for optimal display",
  aspectRatio = 1,
  cropWidth = 80,
  maxFileSize = 5,
  acceptedFileTypes = "image/*",
  showPreview = false,
  previewUrl,
  previewClassName = "",
  previewSize = { width: 100, height: 100 },
  disabled = false,
}) => {
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    isModalOpen: false,
    selectedFile: null,
    imagePreview: '',
    showCropInterface: false,
    isUploading: false,
  });

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const imageUrl = res[0].url;
        onImageUpload(imageUrl);
        resetModal();
        toast.success("Image uploaded successfully!");
      }
      setUploadState(prev => ({ ...prev, isUploading: false }));
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploadState(prev => ({ ...prev, isUploading: false }));
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Kindly select a valid image file");
      return;
    }

    setUploadState(prev => ({ ...prev, selectedFile: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState(prev => ({
        ...prev,
        imagePreview: e.target?.result as string,
        showCropInterface: true
      }));
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const imgElement = e.currentTarget;

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: cropWidth,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    );

    setUploadState(prev => ({ ...prev, crop, imgRef: imgElement }));
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width! * pixelRatio * scaleX;
    canvas.height = crop.height! * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width! * scaleX,
      crop.height! * scaleY,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const uploadCroppedImage = async () => {
    if (!uploadState.imgRef || !uploadState.completedCrop) {
      toast.error("Kindly crop the image first");
      return;
    }

    try {
      setUploadState(prev => ({ ...prev, isUploading: true }));
      const croppedImageBlob = await getCroppedImg(uploadState.imgRef, uploadState.completedCrop);
      const croppedFile = new File([croppedImageBlob], uploadState.selectedFile?.name || 'cropped-image.jpg', {
        type: 'image/jpeg',
      });

      await startUpload([croppedFile]);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast.error("Failed to upload cropped image");
      setUploadState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const resetModal = () => {
    setUploadState({
      isModalOpen: false,
      selectedFile: null,
      imagePreview: '',
      showCropInterface: false,
      isUploading: false,
    });
  };

  const openModal = () => {
    if (!disabled) {
      setUploadState(prev => ({ ...prev, isModalOpen: true }));
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <div className={`relative group cursor-pointer ${previewClassName}`} onClick={openModal}>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center hover:border-blue-400 transition-colors relative"
          style={{ width: previewSize.width, height: previewSize.height }}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes={`${previewSize.width}px`}
            />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {previewUrl && (
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Edit className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {showPreview ? (
        renderPreview()
      ) : (
        <Button
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          onClick={openModal}
          disabled={disabled || uploadState.isUploading}
          className={`${buttonClassName}`}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploadState.isUploading ? "Uploading..." : buttonText}
        </Button>
      )}

      {/* Image Upload Modal */}
      <Dialog open={uploadState.isModalOpen} onOpenChange={(open) => !open && resetModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {modalDescription}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {!uploadState.showCropInterface ? (
              /* File Input */
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept={acceptedFileTypes}
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: {maxFileSize}MB. Supported formats: {acceptedFileTypes}
                </p>
              </div>
            ) : (
              /* Crop Interface */
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Crop Your Image
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Drag to adjust the crop area for optimal display
                  </p>
                </div>

                {/* Crop Tool */}
                <div className="flex justify-center">
                  <ReactCrop
                    crop={uploadState.crop}
                    onChange={(_, percentCrop) => setUploadState(prev => ({ ...prev, crop: percentCrop }))}
                    onComplete={(c) => setUploadState(prev => ({ ...prev, completedCrop: c }))}
                    aspect={aspectRatio}
                    className="max-w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Crop preview"
                      src={uploadState.imagePreview}
                      onLoad={onImageLoad}
                      className="max-h-80"
                    />
                  </ReactCrop>
                </div>

                {/* Crop Actions */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setUploadState(prev => ({ ...prev, showCropInterface: false }))}
                    className="px-4 py-2"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadCroppedImage}
                    disabled={uploadState.isUploading || !uploadState.completedCrop}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 disabled:opacity-50"
                  >
                    {uploadState.isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Cropped Image
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {!uploadState.showCropInterface && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={resetModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

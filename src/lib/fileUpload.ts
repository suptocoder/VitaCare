/**
 * Optimized file upload utilities with compression and progress tracking
 * Now uses a Proxy API route to bypass CORS issues
 */

// Compress image files before upload
export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
    // Only compress images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                const maxDimension = 1920;
                if (width > height && width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Try different quality levels to meet size requirement
                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image'));
                                return;
                            }

                            const sizeMB = blob.size / (1024 * 1024);

                            // If still too large and quality can be reduced, try again
                            if (sizeMB > maxSizeMB && quality > 0.1) {
                                quality -= 0.1;
                                tryCompress();
                                return;
                            }

                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });

                            resolve(compressedFile);
                        },
                        file.type,
                        quality
                    );
                };

                tryCompress();
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

// Upload file to Proxy API
export async function uploadToProxy(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ finalUrl: string; readUrl: string }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress?.(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        onProgress?.(100);
                        resolve(response);
                    }
                } catch (e) {
                    reject(new Error('Invalid response from server'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
        });

        xhr.open('POST', '/api/upload');
        // Do not set Content-Type header for FormData, browser sets it automatically with boundary
        xhr.send(formData);
    });
}

// Optimized upload with compression (Proxy Version)
export async function optimizedFileUpload(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ signedUrl: string; finalUrl: string; compressedFile: File }> {
    try {
        // Step 1: Compress if it's an image (10% progress)
        onProgress?.(10);
        const compressedFile = await compressImage(file);

        const sizeSaved = file.size - compressedFile.size;
        if (sizeSaved > 0) {
            console.log(`Compressed file by ${(sizeSaved / 1024).toFixed(2)} KB`);
        }

        // Step 2: Upload to Proxy (20% to 100%)
        onProgress?.(20);

        const { finalUrl, readUrl } = await uploadToProxy(compressedFile, (uploadProgress) => {
            const totalProgress = 20 + (uploadProgress * 0.8);
            onProgress?.(totalProgress);
        });

        // We return readUrl as signedUrl to maintain compatibility with the interface
        return { signedUrl: readUrl, finalUrl, compressedFile };
    } catch (error) {
        console.error('Optimized upload failed:', error);
        throw error;
    }
}

// Validate file before upload
export function validateFile(
    file: File,
    maxSizeMB: number = 10,
    allowedTypes: string[] = ['image/*', 'application/pdf']
): { valid: boolean; error?: string } {
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
        return {
            valid: false,
            error: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
        };
    }

    // Check file type
    const isAllowed = allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return file.type.startsWith(category + '/');
        }
        return file.type === type;
    });

    if (!isAllowed) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    return { valid: true };
}

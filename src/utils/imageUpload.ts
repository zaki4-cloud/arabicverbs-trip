/**
 * Client-side image optimization helper for mobile and desktop uploads.
 * Reads image files from phones or computers, scales down large camera shots,
 * and outputs a compact, high-quality Base64 Data URL (JPEG ~60-150KB)
 * that safely saves to Firestore, localStorage, and works across all devices.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('הקובץ שנבחר אינו קובץ תמונה תקין.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('שגיאה בקריאת קובץ התמונה.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('שגיאה בטעינת התמונה למערכת.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Fill with white background in case of transparent PNGs converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// src/utils/imageUtils.js

/**
 * Verifică dacă o sursă de imagine este în format base64
 * @param {string} src - Sursa imaginii
 * @returns {boolean} - true dacă imaginea este în format base64, false în caz contrar
 */
export const isBase64Image = (src) => {
    return src && (src.startsWith('data:image/') || src.startsWith('data:application/octet-stream'));
  };
  
  /**
   * Obține sursa corectă a imaginii, indiferent de format (URL sau base64)
   * @param {string} imageSrc - Sursa originală a imaginii
   * @param {string} fallbackSrc - Sursa de rezervă în cazul în care imaginea originală nu există
   * @returns {string} - Sursa corectă a imaginii
   */
  export const getImageSource = (imageSrc, fallbackSrc = '/assets/blankProfile.png') => {
    if (!imageSrc) {
      return fallbackSrc;
    }
    
    // Returnează direct imaginea, indiferent dacă este base64 sau URL
    return imageSrc;
  };
  
  /**
   * Redimensionează și comprimă o imagine înainte de a o converti în base64
   * @param {File} file - Fișierul de imagine
   * @param {Object} options - Opțiuni de redimensionare și compresie
   * @param {number} options.maxWidth - Lățimea maximă a imaginii (implicit 300px)
   * @param {number} options.maxHeight - Înălțimea maximă a imaginii (implicit 450px)
   * @param {number} options.quality - Calitatea imaginii (0-1, implicit 0.7)
   * @returns {Promise<string>} - Promisiune care se rezolvă cu string-ul base64
   */
  export const optimizeAndConvertToBase64 = (file, options = {}) => {
    const maxWidth = options.maxWidth || 300;
    const maxHeight = options.maxHeight || 450;
    const quality = options.quality || 0.7;
    
    return new Promise((resolve, reject) => {
      // Verifică dacă fișierul este o imagine
      if (!file.type.match(/image.*/)) {
        reject(new Error('Fișierul selectat nu este o imagine.'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          // Calculează dimensiunile pentru a păstra raportul de aspect
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          // Creează un canvas pentru redimensionare
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Desenează imaginea redimensionată pe canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertește canvas-ul în base64 cu compresie
          const base64 = canvas.toDataURL(file.type, quality);
          
          resolve(base64);
        };
        
        img.onerror = () => {
          reject(new Error('Eroare la încărcarea imaginii.'));
        };
        
        img.src = readerEvent.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Eroare la citirea fișierului.'));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Verifică dimensiunea unui string base64 în bytes
   * @param {string} base64String - String-ul base64
   * @returns {number} - Dimensiunea în bytes
   */
  export const getBase64Size = (base64String) => {
    // Elimină header-ul (de ex. "data:image/jpeg;base64,")
    const base64WithoutHeader = base64String.split(',')[1];
    
    // Calculează dimensiunea în bytes
    const sizeInBytes = Math.ceil((base64WithoutHeader.length * 3) / 4);
    
    return sizeInBytes;
  };
  
  /**
   * Convertește un fișier în format base64 (metoda originală, fără optimizare)
   * @param {File} file - Fișierul de convertit
   * @returns {Promise<string>} - Promisiune care se rezolvă cu string-ul base64
   */
  export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
const API_BASE_URL = "http://localhost:5001"; // ya jo bhi aapka backend URL hai

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    // Agar already full URL hai (http:// ya https:// se start)
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    
    // Agar relative path hai (/products/...) toh base URL add karo
    if (imagePath.startsWith("/")) {
        return `${API_BASE_URL}${imagePath}`;
    }
    
    return imagePath;
};
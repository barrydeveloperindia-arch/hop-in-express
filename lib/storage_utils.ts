import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The File object to upload.
 * @param path The path in the storage bucket (e.g., 'staff/123/profile.jpg').
 * @returns Promise resolving to the download URL.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        console.log(`[Cloud Storage] Uploaded to ${path}: ${url}`);
        return url;
    } catch (error) {
        console.error("[Cloud Storage] Upload Failed:", error);
        throw error;
    }
};

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { storage } from "../../firebase";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import {
  UploadResult,
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getUserProfilePicture } from "../services/firebase";

interface ProfileContextValue {
  profilePicUrl: string | null;
  getUserProfilePic: (userId: string) => Promise<string | null>;
  uploadProfilePicture: (userId: string, photo: any) => Promise<UploadResult>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  const getUserProfilePic = async (userId: string) => {
    try {
      const profilePicUrl = await getUserProfilePicture(userId);
      if (profilePicUrl) {
        setProfilePicUrl(profilePicUrl);
        return profilePicUrl;
      } else {
        setProfilePicUrl(null);
        return null;
      }
    } catch (err) {
      console.log("Error getting user profile picture: ", err);
      return null;
    }
  };

  const configureImage = async (image, imageSize) => {
    let selectedQuality = 1; // Default quality
    // Check if image size is greater than 1MB (1MB = 1,000,000 bytes)
    if (imageSize > 700000) {
      console.log("imageSize > 1MB");
      selectedQuality = 0.5; // Reduce quality to 0.8 if image size is greater than 1MB
    }
    let processedResult = null;
    // Process the image with the selected quality
    if (selectedQuality < 1) {
      console.log("selectedQuality < 1");
      processedResult = await manipulateAsync(image.uri, [], {
        compress: 0.1,
        format: SaveFormat.PNG,
      });
    } else {
      console.log("selectedQuality === 1");
      processedResult = await manipulateAsync(image.uri, [], {
        format: SaveFormat.PNG,
      });
    }
    return processedResult;
  };

  const createBlob = async (photo) => {
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response); // when BlobModule finishes reading, resolve with the blob
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed")); // error occurred, rejecting
      };
      xhr.responseType = "blob"; // use BlobModule's UriHandler
      xhr.open("GET", photo.uri, true); // fetch the blob from uri in async mode
      xhr.send(null); // no initial data
    });
    return blob;
  };

  const uploadProfilePicture = async (userId: string, photo: string) => {
    const blob = await createBlob(photo);
    const configuredPhoto = await configureImage(photo, blob.size);
    if (configuredPhoto === null) {
      return null;
    } else {
      const filename = configuredPhoto.uri.substring(
        configuredPhoto.uri.lastIndexOf("/") + 1
      );
      const reference = ref(storage, `profilePics/${userId}/${filename}`);

      // Delete previous profile picture
      const listRef = ref(storage, `profilePics/${userId}`);
      const list = await listAll(listRef);
      if(list.items.length !== 0) {
        const existingProfilePicSnapshot = await getDownloadURL(list.items[0]);
        if (existingProfilePicSnapshot) {
          await deleteObject(list.items[0]);
        }
      }
      const snapshot = await uploadBytes(reference, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setProfilePicUrl(downloadUrl);
      return snapshot;
    }
  };

  const value: ProfileContextValue = {
    profilePicUrl,
    getUserProfilePic,
    uploadProfilePicture
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

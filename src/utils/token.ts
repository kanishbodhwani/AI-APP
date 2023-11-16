import { getNewAccessToken } from "../services/gmailService";
import { getSecure, saveSecure } from "./secureStorage";

export const isAccessTokenExpired = (accessTokenString) => {
    const [, expiresIn] = accessTokenString.split(' ');
    const expirationTime = parseInt(expiresIn, 10);
    const currentTime = new Date().getTime(); 
    return currentTime > expirationTime;
};

export const saveNewAccessToken = async () => {
    const refreshToken = await getSecure('refreshToken');
    const newAccessToken = await getNewAccessToken(refreshToken);
    const expiresIn = new Date().getTime() + (newAccessToken.expiresIn * 1000);
    const newAccessTokenString = `${newAccessToken.accessToken} ${expiresIn}`;
    await saveSecure('accessToken', newAccessTokenString);
    return newAccessTokenString;
}
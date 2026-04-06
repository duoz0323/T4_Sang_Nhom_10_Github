/**
 * GUEST LOGIN SERVICE
 * 
 * Tự động login với guest account khi chưa có token
 * để có thể xem jobs public mà không cần đăng ký
 */

import { authAPI, profileAPI } from './api';

const GUEST_CREDENTIALS = {
  email: 'guest@jobmatch.com',
  password: 'Guest123!@#'
};

// Save auth data to localStorage
const saveAuthData = (data) => {
  const accessToken = data.accessToken || data.access_token;
  const tokenType = data.tokenType || data.token_type || 'Bearer';
  const expiresIn = data.expiresIn || data.expires_in;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('tokenType', tokenType);
  
  if (expiresIn) {
    const expiresAt = new Date().getTime() + (parseInt(expiresIn) * 1000);
    localStorage.setItem('expiresAt', expiresAt);
  }
};

/**
 * Auto login với guest account
 * @returns {Promise<boolean>} true nếu login thành công
 */
export const autoLoginAsGuest = async () => {
  try {
    const response = await authAPI.loginCandidate(GUEST_CREDENTIALS);
    
    if (response?.data?.code === 1000) {
      const authData = response.data.result;
      saveAuthData(authData);
      
      // Fetch profile
      try {
        const profileResponse = await profileAPI.getMyCandidateProfile();
        if (profileResponse?.data?.code === 1000) {
          const userProfile = profileResponse.data.result;
          const userData = {
            id: userProfile.candidateProfileId,
            name: 'Guest User',
            email: userProfile.email,
            avatar: userProfile.avatar,
            role: 'GUEST',
            isGuest: true
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        // Silent fail for profile fetch
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Guest login error:', error);
    return false;
  }
};

/**
 * Kiểm tra và auto-login nếu cần
 */
export const ensureAuthenticated = async () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return await autoLoginAsGuest();
  }
  
  // Check if token expired
  const expiresAt = localStorage.getItem('expiresAt');
  if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
    return await autoLoginAsGuest();
  }
  
  return true;
};

export default {
  autoLoginAsGuest,
  ensureAuthenticated
};

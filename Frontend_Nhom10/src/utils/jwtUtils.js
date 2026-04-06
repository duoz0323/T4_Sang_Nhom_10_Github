/**
 * JWT Utilities - Xử lý JWT token
 */

/**
 * Decode JWT token (không cần verify signature vì đây là client-side)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Lấy user roles từ JWT token
 * @param {string} token - JWT token
 * @returns {Array<string>} Danh sách roles
 */
export const getRolesFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return [];

  // Keycloak lưu roles trong realm_access.roles
  return payload.realm_access?.roles || [];
};

/**
 * Kiểm tra xem user có role cụ thể không
 * @param {string} token - JWT token
 * @param {string} role - Role cần kiểm tra (CANDIDATE, COMPANY, ADMIN)
 * @returns {boolean}
 */
export const hasRole = (token, role) => {
  const roles = getRolesFromToken(token);
  return roles.includes(role);
};

/**
 * Lấy loại user từ token (CANDIDATE | COMPANY | ADMIN)
 * @param {string} token - JWT token
 * @returns {string|null} User type
 */
export const getUserType = (token) => {
  const roles = getRolesFromToken(token);

  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('COMPANY')) return 'COMPANY';
  if (roles.includes('CANDIDATE')) return 'CANDIDATE';

  return null;
};

/**
 * Lấy email từ JWT token
 * @param {string} token - JWT token
 * @returns {string|null} Email
 */
export const getEmailFromToken = (token) => {
  const payload = decodeJWT(token);
  return payload?.email || payload?.preferred_username || null;
};

/**
 * Kiểm tra token đã hết hạn chưa
 * @param {string} token - JWT token
 * @returns {boolean} true nếu hết hạn
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  // exp là Unix timestamp (seconds)
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * Lấy thời gian hết hạn của token
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date
 */
export const getTokenExpiration = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;

  return new Date(payload.exp * 1000);
};

/**
 * Lấy user ID (subject) từ token
 * @param {string} token - JWT token
 * @returns {string|null} User ID
 */
export const getUserIdFromToken = (token) => {
  const payload = decodeJWT(token);
  return payload?.sub || null;
};

/**
 * Log token info (for debugging)
 * @param {string} token - JWT token
 */
export const logTokenInfo = (token) => {
  const payload = decodeJWT(token);
  if (!payload) {
    console.log('Invalid token');
    return;
  }

  console.log('=== JWT Token Info ===');
  console.log('User ID:', payload.sub);
  console.log('Email:', payload.email || payload.preferred_username);
  console.log('Roles:', payload.realm_access?.roles || []);
  console.log('Issued At:', new Date(payload.iat * 1000).toLocaleString());
  console.log('Expires At:', new Date(payload.exp * 1000).toLocaleString());
  console.log('Expired:', isTokenExpired(token));
  console.log('=====================');
};

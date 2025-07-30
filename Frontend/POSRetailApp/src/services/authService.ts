import apiClient, { handleApiResponse, handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, LoginResponse, User } from '@/types';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const data = handleApiResponse(response);
      
      // Store auth data
      await this.storeAuthData(data);
      
      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear stored auth data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  private static async storeAuthData(authData: LoginResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, authData.token],
        [STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(authData.user)],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  static async getUserRole(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      return user?.role || null;
    } catch (error) {
      console.error('Error retrieving user role:', error);
      return null;
    }
  }

  static async hasPermission(requiredRoles: string[]): Promise<boolean> {
    try {
      const userRole = await this.getUserRole();
      return userRole ? requiredRoles.includes(userRole) : false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
}

export default AuthService;
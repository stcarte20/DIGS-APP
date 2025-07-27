// Consolidated Office365 Service - Single service for all Office365 operations
import { Office365UsersService } from './Office365UsersService';

declare global {
  interface Window {
    powerPlatformSDK?: any;
  }
}

export interface Office365User {
  id?: string;
  displayName?: string;
  jobTitle?: string;
  userPrincipalName?: string;
  mail?: string;
  givenName?: string;
  surname?: string;
  department?: string;
  officeLocation?: string;
  employeeId?: string;
  manager?: Office365User;
}

export interface SearchResult {
  success: boolean;
  error?: string;
  processedUsers?: Office365User[];
}

export class Office365Service {
  /**
   * Get the current user's profile
   */
  public static async getCurrentUser(): Promise<Office365User | null> {
    try {
      console.log('🔍 Office365Service: Starting getCurrentUser...');
      const result = await Office365UsersService.MyProfile_V2(
        'id,displayName,jobTitle,userPrincipalName,mail,givenName,surname,department,officeLocation,employeeId'
      );

      console.log('📋 Office365Service: MyProfile_V2 raw result:', result);

      if (result && (result.isSuccess === true || result.success === true) && result.data) {
        const userData = result.data as any;
        console.log('✅ Office365Service: Successfully got user data:', userData);
        
        return {
          id: userData.Id || userData.id,
          displayName: userData.DisplayName || userData.displayName,
          jobTitle: userData.JobTitle || userData.jobTitle,
          userPrincipalName: userData.UserPrincipalName || userData.userPrincipalName || userData.Mail || userData.mail,
          mail: userData.Mail || userData.mail,
          givenName: userData.GivenName || userData.givenName,
          surname: userData.Surname || userData.surname,
          department: userData.Department || userData.department,
          officeLocation: userData.OfficeLocation || userData.officeLocation,
          employeeId: userData.EmployeeId || userData.employeeId
        };
      } else {
        console.warn('⚠️ Office365Service: MyProfile API unsuccessful', result);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Office365Service: Error during getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Get user details by ID including manager information
   */
  public static async getUserById(userId: string): Promise<Office365User | null> {
    try {
      console.log('🔍 Office365Service: Starting getUserById for:', userId);
      
      // First try to get the user by searching for their ID
      const searchResult = await this.searchUsers(userId, 1);
      
      if (searchResult.success && searchResult.processedUsers && searchResult.processedUsers.length > 0) {
        const user = searchResult.processedUsers[0];
        console.log('✅ Office365Service: Found user by ID:', user);
        
        // Try to get manager information
        const userWithManager = await this.getUserWithManager(user);
        return userWithManager;
      } else {
        console.warn('⚠️ Office365Service: User not found by ID:', userId);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Office365Service: Error during getUserById:', error);
      return null;
    }
  }

  /**
   * Get manager information for a user
   */
  public static async getUserManager(user: Office365User): Promise<Office365User | null> {
    try {
      console.log('🔍 Office365Service: Getting manager for user:', user.displayName);
      
      if (!user.userPrincipalName && !user.mail && !user.id) {
        console.warn('⚠️ Office365Service: No user identifier available for manager lookup');
        return null;
      }

      // Use the user's userPrincipalName, mail, or id as the identifier
      const userId = user.userPrincipalName || user.mail || user.id;
      
      if (!userId) {
        console.warn('⚠️ Office365Service: No valid user identifier found');
        return null;
      }

      console.log('📋 Office365Service: Calling Manager endpoint with userId:', userId);
      const result = await Office365UsersService.Manager(userId);

      console.log('📋 Office365Service: Manager API raw result:', result);

      if (result && (result.isSuccess === true || result.success === true) && result.data) {
        const managerData = result.data as any;
        console.log('✅ Office365Service: Successfully got manager data:', managerData);
        
        return {
          id: managerData.Id || managerData.id,
          displayName: managerData.DisplayName || managerData.displayName,
          jobTitle: managerData.JobTitle || managerData.jobTitle,
          userPrincipalName: managerData.UserPrincipalName || managerData.userPrincipalName,
          mail: managerData.Mail || managerData.mail,
          givenName: managerData.GivenName || managerData.givenName,
          surname: managerData.Surname || managerData.surname,
          department: managerData.Department || managerData.department,
          officeLocation: managerData.OfficeLocation || managerData.officeLocation,
          employeeId: managerData.EmployeeId || managerData.employeeId
        };
      } else {
        console.log('ℹ️ Office365Service: Manager API unsuccessful or no manager found:', result);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Office365Service: Error getting manager:', error);
      return null;
    }
  }

  /**
   * Get user with manager information
   */
  public static async getUserWithManager(user: Office365User): Promise<Office365User> {
    try {
      const manager = await this.getUserManager(user);
      return {
        ...user,
        manager: manager || undefined
      };
    } catch (error) {
      console.error('❌ Office365Service: Error getting user with manager:', error);
      return user;
    }
  }

  /**
   * Search for users
   */
  public static async searchUsers(searchTerm: string, limit: number = 10): Promise<SearchResult> {
    try {
      console.log('🔍 Office365Service: Starting searchUsers with term:', searchTerm, 'limit:', limit);
      
      // Try different parameter combinations
      let result;
      
      // First try: with isSearchTermRequired = true
      try {
        console.log('📋 Office365Service: Trying SearchUserV2 with isSearchTermRequired=true...');
        result = await Office365UsersService.SearchUserV2(
          searchTerm, 
          limit, 
          true
        );
        console.log('📋 Office365Service: SearchUserV2 (attempt 1) raw result:', result);
      } catch (error) {
        console.warn('⚠️ Office365Service: First attempt failed:', error);
        
        // Second try: with isSearchTermRequired = false
        console.log('📋 Office365Service: Trying SearchUserV2 with isSearchTermRequired=false...');
        result = await Office365UsersService.SearchUserV2(
          searchTerm, 
          limit, 
          false
        );
        console.log('📋 Office365Service: SearchUserV2 (attempt 2) raw result:', result);
      }

      if (result && (result.isSuccess === true || result.success === true)) {
        let users: any[] = [];
        
        // Handle different response structures
        if (result.data?.value && Array.isArray(result.data.value)) {
          users = result.data.value;
          console.log('✅ Office365Service: Found users in data.value:', users.length);
        } else if (Array.isArray(result.data)) {
          users = result.data;
          console.log('✅ Office365Service: Found users in data array:', users.length);
        } else if (result.data && typeof result.data === 'object') {
          users = [result.data];
          console.log('✅ Office365Service: Found single user in data:', users.length);
        } else {
          console.log('⚠️ Office365Service: No users found in result.data:', result.data);
        }

        // Process users to ensure consistent format
        const processedUsers = users.map(user => ({
          id: user.Id || user.id,
          displayName: user.DisplayName || user.displayName,
          jobTitle: user.JobTitle || user.jobTitle,
          userPrincipalName: user.UserPrincipalName || user.userPrincipalName,
          mail: user.Mail || user.mail,
          givenName: user.GivenName || user.givenName,
          surname: user.Surname || user.surname,
          department: user.Department || user.department,
          officeLocation: user.OfficeLocation || user.officeLocation,
          employeeId: user.EmployeeId || user.employeeId
        }));

        console.log('✅ Office365Service: Processed users:', processedUsers);

        return {
          success: true,
          processedUsers
        };
      } else {
        console.warn('⚠️ Office365Service: Search unsuccessful', result);
        return {
          success: false,
          error: result?.error || result?.errorMessage || 'Search unsuccessful',
          processedUsers: []
        };
      }
      
    } catch (error) {
      console.error('❌ Office365Service: Error during searchUsers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processedUsers: []
      };
    }
  }

  /**
   * Test method for compatibility with existing test page - getCurrentUser
   */
  public static async testMyProfile(): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      return {
        timestamp: new Date().toLocaleString(),
        testType: 'myProfile' as const,
        success: !!user,
        currentUser: user,
        environment: {
          isDevelopment: process.env.NODE_ENV === 'development',
          isPowerPlatformEnv: false,
          userAgent: navigator.userAgent
        }
      };
    } catch (error) {
      return {
        timestamp: new Date().toLocaleString(),
        testType: 'myProfile' as const,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          isDevelopment: process.env.NODE_ENV === 'development',
          isPowerPlatformEnv: false,
          userAgent: navigator.userAgent
        }
      };
    }
  }

  /**
   * Test method for compatibility with existing test page - searchUsers
   */
  public static async testSearch(searchTerm: string, limit: number = 10): Promise<any> {
    try {
      const result = await this.searchUsers(searchTerm, limit);
      return {
        timestamp: new Date().toLocaleString(),
        testType: 'searchUser' as const,
        searchTerm,
        success: result.success,
        error: result.error,
        processedUsers: result.processedUsers,
        environment: {
          isDevelopment: process.env.NODE_ENV === 'development',
          isPowerPlatformEnv: false,
          userAgent: navigator.userAgent
        }
      };
    } catch (error) {
      return {
        timestamp: new Date().toLocaleString(),
        testType: 'searchUser' as const,
        searchTerm,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processedUsers: [],
        environment: {
          isDevelopment: process.env.NODE_ENV === 'development',
          isPowerPlatformEnv: false,
          userAgent: navigator.userAgent
        }
      };
    }
  }
}

// Keep the legacy interface for backward compatibility
export interface SimpleUser extends Office365User {}

// Export default for easy importing
export default Office365Service;

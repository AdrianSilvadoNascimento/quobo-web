import { server } from './api';

export interface UpdateUserData {
  id: string;
  name?: string;
  lastname?: string;
  email?: string;
  phone_number?: string;
  avatar?: string;
}

export interface UpdateUserResponse {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  type: string;
  role: string;
}

export const userApi = {
  /**
   * Update user profile
   */
  updateUser: async (data: UpdateUserData): Promise<UpdateUserResponse> => {
    const response = await server.api.put('/user', data);
    return response.data;
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (userId: string, file: File): Promise<UpdateUserResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('id', userId);

    const response = await server.api.put('/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

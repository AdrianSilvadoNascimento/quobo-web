import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class Server {
  readonly tokenPrefix = 'Bearer';
  readonly baseURL = API_URL.endsWith('/api/v2') ? API_URL : `${API_URL}/api/v2`;
  api = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
  });

  constructor() { }
}

export const server = new Server();

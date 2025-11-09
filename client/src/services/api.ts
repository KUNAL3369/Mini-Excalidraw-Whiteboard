import { Shape } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface APIError extends Error {
  status?: number;
}

const handleResponse = async (response: Response) => {
  const text = await response.text();
  let data: any = text;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json') && text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // keep raw text if JSON.parse fails
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    const error: APIError = new Error(`API request failed: ${response.status} ${response.statusText} - ${message}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return data;
};

export const api = {
  // Shapes
  getShapes: async (): Promise<Shape[]> => {
    try {
      const response = await fetch(`${API_URL}/api/shapes`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching shapes:', error);
      throw error;
    }
  },

  createShape: async (shape: Omit<Shape, 'id'>): Promise<Shape> => {
    try {
      const response = await fetch(`${API_URL}/api/shapes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shape),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating shape:', error);
      throw error;
    }
  },

  updateShape: async (id: string, updates: Partial<Shape>): Promise<Shape> => {
    try {
      const response = await fetch(`${API_URL}/api/shapes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating shape:', error);
      throw error;
    }
  },

  deleteShape: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/shapes/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting shape:', error);
      throw error;
    }
  },

  // Pages
  getPages: async () => {
    try {
      const response = await fetch(`${API_URL}/api/pages`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  createPage: async (name: string) => {
    try {
      console.log('api.createPage -> POST', `${API_URL}/api/pages`, { name });
      const response = await fetch(`${API_URL}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await handleResponse(response);
      console.log('api.createPage -> success', result);
      return result;
    } catch (error) {
      console.error('Error creating page:', error);
      // Re-throw with normalized Error
      if (error instanceof Error) throw error;
      throw new Error('Unknown error creating page');
    }
  },

  getPageShapes: async (pageId: string): Promise<Shape[]> => {
    try {
      const response = await fetch(`${API_URL}/api/pages/${pageId}/shapes`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching page shapes:', error);
      throw error;
    }
  },

  updatePage: async (id: string, updates: { name: string }): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  },

  deletePage: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/pages/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  },
};
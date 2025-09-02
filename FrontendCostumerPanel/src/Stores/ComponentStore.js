import { create } from 'zustand';
import axios from 'axios';

const useComponentStore = create((set) => ({
  // Store component data
  components: [],
  selectedComponent: null,
  isLoading: false,
  error: null,
  
  // Actions
  setComponents: (components) => set({ components }),
  
  // Fetch components from API
  fetchComponents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/components');
      set({ components: response.data, isLoading: false });
      return response.data.data.components;
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },

  addComponent: (component) => 
    set((state) => ({ 
      components: [...state.components, component] 
    })),
    
  updateComponent: (id, updatedComponent) =>
    set((state) => ({
      components: state.components.map((comp) => 
        comp.id === id ? { ...comp, ...updatedComponent } : comp
      )
    })),
    
  deleteComponent: (id) =>
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id)
    })),
    
  selectComponent: (component) => 
    set({ selectedComponent: component }),
    
  clearSelectedComponent: () => 
    set({ selectedComponent: null }),

  // Reset store
  reset: () => set({ 
    components: [],
    selectedComponent: null,
    isLoading: false,
    error: null
  })
}));

export default useComponentStore;

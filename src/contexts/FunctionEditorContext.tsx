import { createContext, useContext, useState, ReactNode } from 'react';

interface FunctionEditorContextType {
  editingFunctionId: string | null;
  setEditingFunctionId: (id: string | null) => void;
}

const FunctionEditorContext = createContext<FunctionEditorContextType | undefined>(undefined);

export const FunctionEditorProvider = ({ children }: { children: ReactNode }) => {
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(null);

  return (
    <FunctionEditorContext.Provider value={{ editingFunctionId, setEditingFunctionId }}>
      {children}
    </FunctionEditorContext.Provider>
  );
};

export const useFunctionEditor = () => {
  const context = useContext(FunctionEditorContext);
  if (!context) {
    throw new Error('useFunctionEditor must be used within FunctionEditorProvider');
  }
  return context;
};

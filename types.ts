
export enum InputType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  NUMBER = 'NUMBER'
}

export interface WorkflowField {
  id: string;
  key: string;
  label: string;
  type: InputType;
  placeholder?: string;
  options?: string[];
}

export interface AssetItem {
  id: string;
  name: string;
  data: string; // base64 data string
  url: string; // External URL or Blob URL
  isDefault: boolean; // to distinguish between system assets and user uploads
}

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  rawContent: string;
  
  // AI Outputs
  generatedDraft: string;
  imagePrompt: string;
  
  // System State
  assets: AssetItem[];
  assetsLoaded: boolean;
  loadingProgress: string;
  isProcessing: boolean;
  
  // Final Result
  generatedImage: string | null;
}

export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
}

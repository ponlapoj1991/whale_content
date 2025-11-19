import React, { useState } from 'react';
import { WorkflowField, InputType } from '../types';
import { Plus, Trash2, Settings } from 'lucide-react';

interface FieldBuilderProps {
  fields: WorkflowField[];
  onChange: (fields: WorkflowField[]) => void;
}

export const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newField, setNewField] = useState<Partial<WorkflowField>>({
    type: InputType.TEXT,
    key: '',
    label: ''
  });

  const handleAddField = () => {
    if (!newField.key || !newField.label) return;
    
    const field: WorkflowField = {
      id: crypto.randomUUID(),
      key: newField.key,
      label: newField.label,
      type: newField.type || InputType.TEXT,
      options: newField.type === InputType.SELECT ? [] : undefined,
      placeholder: `Enter ${newField.label}...`
    };

    onChange([...fields, field]);
    setNewField({ type: InputType.TEXT, key: '', label: '' });
    setIsAdding(false);
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-700">Input Configuration</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} /> Add Field
        </button>
      </div>

      <div className="grid gap-3">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-100 rounded text-slate-500">
                <Settings size={16} />
              </span>
              <div>
                <p className="font-medium text-slate-800">{field.label}</p>
                <p className="text-xs text-slate-500 font-mono">Key: {field.key} | Type: {field.type}</p>
              </div>
            </div>
            <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600 p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {fields.length === 0 && !isAdding && (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
            No inputs defined. Add fields that your n8n workflow expects.
          </div>
        )}
      </div>

      {isAdding && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-800 mb-1">Label (UI Name)</label>
              <input 
                type="text" 
                className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                placeholder="e.g. Blog Topic"
                value={newField.label}
                onChange={e => setNewField({...newField, label: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-800 mb-1">Key (n8n Property)</label>
              <input 
                type="text" 
                className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-mono"
                placeholder="e.g. topic"
                value={newField.key}
                onChange={e => setNewField({...newField, key: e.target.value})}
              />
            </div>
          </div>
          <div>
             <label className="block text-xs font-medium text-blue-800 mb-1">Input Type</label>
             <select 
               className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
               value={newField.type}
               onChange={(e) => setNewField({...newField, type: e.target.value as InputType})}
             >
               <option value={InputType.TEXT}>Text Input</option>
               <option value={InputType.TEXTAREA}>Long Text Area</option>
               <option value={InputType.NUMBER}>Number</option>
             </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddField}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

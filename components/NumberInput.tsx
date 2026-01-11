
import React from 'react';

interface NumberInputProps {
  numbers: string;
  setNumbers: (val: string) => void;
  label: string;
  placeholder: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ numbers, setNumbers, label, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="text"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-lg font-mono text-center dir-ltr"
        style={{ direction: 'ltr' }}
      />
      <p className="text-xs text-gray-400">مثال: 12.5, -18, 24.75 (استخدم الفاصلة للفصل بين الأرقام)</p>
    </div>
  );
};

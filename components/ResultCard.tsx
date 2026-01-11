
import React from 'react';

interface ResultCardProps {
  title: string;
  result: string | number;
  explanation?: string;
  isLoading?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, result, explanation, isLoading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-50 border-t-4 border-t-indigo-500 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {title}
        </h3>
        
        <div className="bg-indigo-50 rounded-xl p-6 text-center mb-6">
          <span className="text-4xl font-extrabold text-indigo-700 font-mono tracking-wider">
            {result}
          </span>
        </div>

        {explanation && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-bold text-indigo-600 mb-2">الشرح التعليمي:</h4>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none prose-indigo whitespace-pre-wrap text-right">
                {explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

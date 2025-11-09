import React, { useState } from 'react';
import { Page } from '../types';

interface PageManagerProps {
  pages: Page[];
  currentPageId: string;
  onPageChange: (pageId: string) => void;
  onPageAdd: () => void;
  onPageDelete: (pageId: string) => void;
  onPageRename: (pageId: string, newName: string) => void;
}

const PageManager = ({
  pages,
  currentPageId,
  onPageChange,
  onPageAdd,
  onPageDelete,
  onPageRename,
}: PageManagerProps) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleRenameStart = (page: Page) => {
    setEditingPageId(page.id);
    setEditName(page.name);
  };

  const handleRenameSave = () => {
    if (editingPageId && editName.trim()) {
      onPageRename(editingPageId, editName.trim());
    }
    setEditingPageId(null);
    setEditName('');
  };

  const handleRenameCancel = () => {
    setEditingPageId(null);
    setEditName('');
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700">Pages:</span>

      <div className="flex gap-1 flex-wrap">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center gap-1">
            {editingPageId === page.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSave();
                    if (e.key === 'Escape') handleRenameCancel();
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded w-20"
                  autoFocus
                />
                <button
                  onClick={handleRenameSave}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  ✓
                </button>
                <button
                  onClick={handleRenameCancel}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(page.id)}
                  className={`px-3 py-1 text-sm rounded border ${
                    currentPageId === page.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page.name}
                </button>
                <button
                  onClick={() => handleRenameStart(page)}
                  className="px-1 py-1 text-xs text-gray-500 hover:text-gray-700"
                  title="Rename page"
                >
                  ✏️
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={() => onPageDelete(page.id)}
                    className="px-1 py-1 text-xs text-red-500 hover:text-red-700"
                    title="Delete page"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={onPageAdd}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded border border-green-500 hover:bg-green-600"
          title="Add new page"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PageManager;

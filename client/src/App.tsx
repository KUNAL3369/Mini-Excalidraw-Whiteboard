import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PageManager from './components/PageManager';
import { Shape, Page, Tool } from './types';
import { api } from './services/api';

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
}

function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [pages, setPages] = useState<Page[]>([
    { id: 'page1', name: 'Page 1', shapes: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>('page1');
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [textStyle, setTextStyle] = useState({
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#000000'
  });

  // Load data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedPages, fetchedShapes] = await Promise.all([
          api.getPages(),
          api.getShapes()
        ]);

        if (fetchedPages.length > 0) {
          setPages(fetchedPages);
          setShapes(fetchedShapes);
          setCurrentPageId(fetchedPages[0].id);
          // Initialize history with fetched shapes
          setHistory([[...fetchedShapes]]);
        } else {
          // Create default page if none exists
          const defaultPage = { name: 'Page 1' };
          const newPage = await api.createPage(defaultPage.name);
          setPages([newPage]);
          setCurrentPageId(newPage.id);
          setHistory([[]]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Fall back to localStorage if API fails
        const savedPages = localStorage.getItem('excalidraw-pages');
        const savedShapes = localStorage.getItem('excalidraw-shapes');
        
        if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          setPages(parsedPages);
          if (savedShapes) {
            const parsedShapes = JSON.parse(savedShapes);
            setShapes(parsedShapes);
            setHistory([[...parsedShapes]]);
          }
          setCurrentPageId(parsedPages[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (shapes.length > 0) {
      localStorage.setItem('excalidraw-shapes', JSON.stringify(shapes));
    }
    if (pages.length > 0) {
      localStorage.setItem('excalidraw-pages', JSON.stringify(pages));
    }
    if (currentPageId) {
      localStorage.setItem('excalidraw-current-page', currentPageId);
    }
  }, [shapes, pages, currentPageId]);

  const addToHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleShapeAdd = useCallback(async (shapeData: Omit<Shape, 'id'>) => {
    try {
      setError(null);
      const newShape = await api.createShape(shapeData);
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      addToHistory(newShapes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add shape');
      // Fall back to local state
      const newShape: Shape = {
        ...shapeData,
        id: Date.now().toString(),
      };
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      addToHistory(newShapes);
    }
  }, [shapes, addToHistory]);

  const handleShapeUpdate = useCallback(async (id: string, updates: Partial<Shape>) => {
    try {
      setError(null);
      const updatedShape = await api.updateShape(id, updates);
      const newShapes = shapes.map(shape =>
        shape.id === id ? updatedShape : shape
      );
      setShapes(newShapes);
      addToHistory(newShapes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shape');
      // Fall back to local state
      const newShapes = shapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      );
      setShapes(newShapes);
      addToHistory(newShapes);
    }
  }, [shapes, addToHistory]);

  const handleShapeSelect = useCallback((id: string | null) => {
    setSelectedShapeId(id);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handlePageChange = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    setSelectedShapeId(null);
  }, []);

  const handlePageAdd = useCallback(async () => {
    try {
      setError(null);
      const newPage = await api.createPage(`Page ${pages.length + 1}`);
      console.log('handlePageAdd -> created page', newPage);
      setPages([...pages, newPage]);
      setCurrentPageId(newPage.id);
    } catch (err) {
      console.error('Create Page Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add page');
      // show a brief alert so user sees the failure in UI during testing
      try { alert(`Failed to create page: ${err instanceof Error ? err.message : err}`); } catch(e) {}
      // Fall back to local state
      const newPage = {
        id: Date.now().toString(),
        name: `Page ${pages.length + 1}`,
        shapes: []
      };
      setPages([...pages, newPage]);
      setCurrentPageId(newPage.id);
    }
  }, [pages]);

  const handlePageDelete = useCallback(async (pageId: string) => {
    if (pages.length <= 1) return;

    try {
      setError(null);
      await api.deletePage(pageId);
      const newPages = pages.filter(p => p.id !== pageId);
      setPages(newPages);

      // Switch to first page if current page is deleted
      if (currentPageId === pageId) {
        setCurrentPageId(newPages[0].id);
      }

      // Remove shapes from deleted page
      const newShapes = shapes.filter(s => s.pageId !== pageId);
      setShapes(newShapes);
      addToHistory(newShapes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
      // Continue with local state update anyway to maintain UI consistency
      const newPages = pages.filter(p => p.id !== pageId);
      setPages(newPages);
      if (currentPageId === pageId) {
        setCurrentPageId(newPages[0].id);
      }
      const newShapes = shapes.filter(s => s.pageId !== pageId);
      setShapes(newShapes);
      addToHistory(newShapes);
    }
  }, [pages, currentPageId, shapes, addToHistory]);

  const handlePageRename = useCallback(async (pageId: string, newName: string) => {
    try {
      setError(null);
      // Note: API needs to be updated to support page renaming
      await api.updatePage(pageId, { name: newName });
      setPages(pages.map(p =>
        p.id === pageId ? { ...p, name: newName } : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename page');
      // Fall back to local state
      setPages(pages.map(p =>
        p.id === pageId ? { ...p, name: newName } : p
      ));
    }
  }, [pages]);

  const handleTextStyleChange = useCallback((style: Partial<TextStyle>) => {
    // Update toolbar state
    setTextStyle(current => ({
      ...current,
      ...style
    }));

    // If a text shape is selected, apply changes immediately
    if (selectedShapeId) {
      const updates: Partial<Shape> = {};
      if (style.color !== undefined) updates.color = style.color;
      if (style.fontSize !== undefined) updates.fontSize = style.fontSize;
      if (style.fontFamily !== undefined) updates.fontFamily = style.fontFamily;

      if (Object.keys(updates).length > 0) {
        // Fire update (this will call API and update local state)
        handleShapeUpdate(selectedShapeId, updates);
      }
    }
  }, [selectedShapeId, handleShapeUpdate]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 fixed top-2 right-2 rounded shadow-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          <PageManager
            pages={pages}
            currentPageId={currentPageId}
            onPageChange={handlePageChange}
            onPageAdd={handlePageAdd}
            onPageDelete={handlePageDelete}
            onPageRename={handlePageRename}
          />

          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            textStyle={textStyle}
            onTextStyleChange={handleTextStyleChange}
            selectedShape={shapes.find(s => s.id === selectedShapeId) || null}
          />

          <div className="flex-1 flex justify-center items-center p-4">
            <Canvas
              shapes={shapes}
              currentTool={currentTool}
              onShapeAdd={handleShapeAdd}
              onShapeUpdate={handleShapeUpdate}
              onShapeSelect={handleShapeSelect}
              selectedShapeId={selectedShapeId}
              currentPageId={currentPageId}
              textStyle={textStyle}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;

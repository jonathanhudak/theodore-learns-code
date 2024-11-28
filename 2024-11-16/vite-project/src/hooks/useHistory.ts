import { useState, useCallback } from "react";

type HistoryState = SceneObject[];
type HistoryAction = {
  type: "PUSH" | "UNDO" | "REDO";
  payload?: HistoryState;
};

const useHistory = (initialState: HistoryState) => {
  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const push = useCallback(
    (newState: HistoryState) => {
      setHistory((prev) => [...prev.slice(0, currentIndex + 1), newState]);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  return {
    state: history[currentIndex],
    push,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};

export default useHistory;

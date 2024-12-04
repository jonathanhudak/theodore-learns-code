import { useState, useCallback } from "react";

interface HistoryState {
  objects: SceneObject[];
  groups: Group[];
}

const useHistory = (initialObjects: SceneObject[], initialGroups: Group[]) => {
  const [index, setIndex] = useState(-1);
  const [history, setHistory] = useState<HistoryState[]>([]);

  const push = useCallback(
    (objects: SceneObject[], groups: Group[]) => {
      setHistory((prev) => [...prev.slice(0, index + 1), { objects, groups }]);
      setIndex((prev) => prev + 1);
    },
    [index]
  );

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      return history[index - 1];
    }
    return null;
  }, [history, index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex((prev) => prev + 1);
      return history[index + 1];
    }
    return null;
  }, [history, index]);

  return {
    push,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};

export default useHistory;

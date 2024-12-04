import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface SavedScene {
  id: string;
  name: string;
  timestamp: number;
  thumbnail?: string;
}

const SceneList: React.FC = () => {
  const [scenes, setScenes] = React.useState<SavedScene[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load saved scenes from localStorage
    const sceneList = localStorage.getItem("sceneList");
    if (sceneList) {
      setScenes(JSON.parse(sceneList));
    }
  }, []);

  const deleteScene = (id: string) => {
    // Remove scene data
    localStorage.removeItem(`scene-${id}`);

    // Update scene list
    const updatedScenes = scenes.filter((scene) => scene.id !== id);
    setScenes(updatedScenes);
    localStorage.setItem("sceneList", JSON.stringify(updatedScenes));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Saved Scenes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <div key={scene.id} className="border p-4 rounded shadow">
            {scene.thumbnail && (
              <img
                src={scene.thumbnail}
                alt={scene.name}
                className="w-full h-32 object-cover mb-2"
              />
            )}
            <h2 className="text-xl">{scene.name}</h2>
            <p className="text-gray-500">
              {new Date(scene.timestamp).toLocaleDateString()}
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                to={`/scenes/${scene.id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteScene(scene.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneList;

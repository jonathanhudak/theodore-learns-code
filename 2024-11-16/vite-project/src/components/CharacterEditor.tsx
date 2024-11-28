/*
 * React Three Fiber Visual Editor
 * Features:
 * 1. Add various geometric shapes (e.g., Sphere, Box, Cone, etc.). ✅
 * 2. Click on an object to select it and enable transformation (scale, rotate, position). ✅
 * 3. Update properties: color, material, and mesh. ✅
 * 4. Add buttons to:
 *    - Reset objects to default properties. ✅
 *    - Save and load objects. ✅
 *    - Delete selected objects. ✅
 * 5. Enhanced lighting for better visibility and contrast: ✅
 *    - Add/remove different light types (ambient, directional, point, spot) ✅
 *    - Adjust light properties (color, intensity) ✅
 *    - Move lights in the scene ✅
 * 6. User-friendly UI for object manipulation: ✅
 *    - Toggleable tools panel with 'T' key or checkbox ✅
 *    - Material controls (metalness, roughness) ✅
 * 7. Advanced editing features:
 *    - Copy/Paste objects (Ctrl/Cmd + C, Ctrl/Cmd + V) ✅
 *    - Duplicate objects (Ctrl/Cmd + D) ✅
 *    - Keyboard controls for object movement (Arrow keys) ✅
 *    - Undo/Redo system ✅
 * 8. Multi-select functionality for selecting multiple objects. ✅
 * 9. Grouping functionality for selected objects. ✅
 * 10. Scene saving and loading functionality. ✅
 *
 * Features still to implement:
 * 11. Click to place objects:
 *     - When placing a new object, allow users to click on the canvas to position it. ⬜
 * 12. Snap-to-grid:
 *     - Objects (especially cubes) should snap to a grid-like system for alignment. ⬜
 *     - Allow cube blocks to snap together, similar to Minecraft mechanics. ⬜
 * 13. Advanced snapping:
 *     - Enable objects to snap to the edges or surfaces of other objects. ⬜
 * 14. Advanced material editor:
 *     - Add more material properties (emissive, normal maps, etc.). ⬜
 *     - Texture upload and mapping controls. ⬜
 * 15. Physics simulation:
 *     - Enable basic gravity and collision for objects. ⬜
 * 16. Scene organization:
 *     - Group/ungroup objects. ⬜
 *     - Layer system or hierarchy view. ⬜
 * 17. Camera controls:
 *     - Save/load camera positions. ⬜
 *     - Multiple viewports (top, front, side). ⬜
 * 18. **New Feature**: Double-click to duplicate an object and snap it to the clicked face, similar to Minecraft mechanics. ⬜
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import useHistory from "../hooks/useHistory";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { keys } from "../keys";

interface GeometryProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}

interface SceneObject extends GeometryProps {
  id: string;
  shape: keyof typeof AVAILABLE_SHAPES;
}

// Available shapes with geometry props
const AVAILABLE_SHAPES = {
  box: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.5, 32, 32]} />,
  cone: <coneGeometry args={[0.5, 1, 32]} />,
  cylinder: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
  torus: <torusGeometry args={[0.5, 0.2, 16, 100]} />,
  plane: <planeGeometry args={[1, 1]} />,
};

interface TransformControlsRef {
  attach: (obj: THREE.Object3D) => void;
  detach: () => void;
}

const Geometry: React.FC<{
  obj: SceneObject;
  selected: boolean;
  onSelect: (e: THREE.Event) => void;
  onDeselect: () => void;
}> = ({ obj, selected, onSelect, onDeselect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<TransformControlsRef | null>(null);

  useEffect(() => {
    if (transformRef.current && meshRef.current && selected) {
      const controls = transformRef.current;
      controls.attach(meshRef.current);
      return () => controls.detach();
    }
  }, [selected]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
        onPointerMissed={onDeselect}
      >
        {AVAILABLE_SHAPES[obj.shape as keyof typeof AVAILABLE_SHAPES]}
        <meshPhysicalMaterial
          color={obj.color}
          metalness={obj.metalness}
          roughness={obj.roughness}
          clearcoat={0.3}
          reflectivity={0.6}
        />
      </mesh>
      {selected && (
        <TransformControls
          ref={transformRef}
          showX={true}
          showY={true}
          showZ={true}
          onObjectChange={() => {
            const { position } = meshRef.current!;
            position.x = Math.round(position.x);
            position.y = Math.round(position.y);
            position.z = Math.round(position.z);
          }}
        />
      )}
    </>
  );
};

const useKeyboardControls = (
  selectedIds: string[],
  setObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  selectedLightId: string | null,
  setLights: React.Dispatch<React.SetStateAction<SceneLight[]>>,
  setSelectedLightId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Handle arrow key movement
      if (e.key.startsWith("Arrow")) {
        const delta = 0.1;

        // Handle object movement
        if (selectedIds?.length > 0) {
          setObjects((prevObjects) =>
            prevObjects.map((obj) => {
              if (!selectedIds.includes(obj.id)) return obj;

              const position = [...obj.position] as [number, number, number];
              switch (e.key) {
                case "ArrowUp":
                  position[1] += delta;
                  break;
                case "ArrowDown":
                  position[1] -= delta;
                  break;
                case "ArrowLeft":
                  position[0] -= delta;
                  break;
                case "ArrowRight":
                  position[0] += delta;
                  break;
              }
              return { ...obj, position };
            })
          );
        }

        // Handle light movement
        if (selectedLightId) {
          setLights((prevLights) =>
            prevLights.map((light) => {
              if (light.id !== selectedLightId || light.type === "ambient")
                return light;

              const position = [...(light.position || [0, 0, 0])] as [
                number,
                number,
                number
              ];
              switch (e.key) {
                case "ArrowUp":
                  position[1] += delta;
                  break;
                case "ArrowDown":
                  position[1] -= delta;
                  break;
                case "ArrowLeft":
                  position[0] -= delta;
                  break;
                case "ArrowRight":
                  position[0] += delta;
                  break;
              }
              return { ...light, position };
            })
          );
        }
        return; // Exit early after handling movement
      }

      // Handle deletion
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds?.length > 0) {
          setObjects((prev) =>
            prev.filter((obj) => !selectedIds.includes(obj.id))
          );
          setSelectedIds([]);
        }
        if (selectedLightId) {
          setLights((prev) =>
            prev.filter((light) => light.id !== selectedLightId)
          );
          setSelectedLightId(null);
        }
        return;
      }

      // Handle copy/paste for objects only
      if ((e.ctrlKey || e.metaKey) && selectedIds?.length > 0) {
        if (e.key === "c") {
          setObjects((prevObjects) => {
            const selectedObject = prevObjects.find((obj) =>
              selectedIds.includes(obj.id)
            );
            if (selectedObject) {
              window.localStorage.setItem(
                "clipboard",
                JSON.stringify(selectedObject)
              );
            }
            return prevObjects;
          });
        } else if (e.key === "v") {
          const clipboardData = window.localStorage.getItem("clipboard");
          if (clipboardData) {
            try {
              const clipboardObject = JSON.parse(clipboardData) as SceneObject;
              setObjects((prevObjects) => [
                ...prevObjects,
                {
                  ...clipboardObject,
                  id: `object-${Date.now()}`,
                  position: [
                    clipboardObject.position[0] + 1,
                    clipboardObject.position[1],
                    clipboardObject.position[2],
                  ],
                },
              ]);
            } catch (error) {
              console.error("Failed to paste object:", error);
            }
          }
        }
      }
    },
    [
      selectedIds,
      setObjects,
      setSelectedIds,
      selectedLightId,
      setLights,
      setSelectedLightId,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

// Add new interface for lights
interface SceneLight {
  id: string;
  type: "ambient" | "directional" | "point" | "spot";
  position?: [number, number, number];
  intensity: number;
  color: string;
}

const Light: React.FC<{
  light: SceneLight;
  selected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onUpdate: (updates: Partial<SceneLight>) => void;
}> = ({ light, selected, onSelect, onDeselect, onUpdate }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.Light>(null);
  const transformRef = useRef<TransformControlsRef>(null);

  useEffect(() => {
    if (transformRef.current && groupRef.current && selected) {
      const controls = transformRef.current;
      controls.attach(groupRef.current);
      return () => controls.detach();
    }
  }, [selected]);

  const handleTransformChange = () => {
    if (groupRef.current && light.type !== "ambient") {
      const position = groupRef.current.position.toArray() as [
        number,
        number,
        number
      ];
      onUpdate({ position });
    }
  };

  const LightComponent = () => {
    switch (light.type) {
      case "ambient":
        return (
          <ambientLight
            ref={lightRef}
            color={light.color}
            intensity={light.intensity}
          />
        );
      case "directional":
        return (
          <directionalLight
            ref={lightRef}
            color={light.color}
            intensity={light.intensity}
            castShadow
          />
        );
      case "point":
        return (
          <pointLight
            ref={lightRef}
            color={light.color}
            intensity={light.intensity}
            castShadow
          />
        );
      case "spot":
        return (
          <spotLight
            ref={lightRef}
            color={light.color}
            intensity={light.intensity}
            castShadow
          />
        );
    }
  };

  return (
    <>
      {light.type === "ambient" ? (
        <LightComponent />
      ) : (
        <group ref={groupRef} position={light.position}>
          <LightComponent />
          <mesh
            scale={[0.2, 0.2, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onPointerMissed={onDeselect}
          >
            <sphereGeometry />
            <meshBasicMaterial color={light.color} />
          </mesh>
        </group>
      )}
      {selected && light.type !== "ambient" && (
        <TransformControls
          ref={transformRef}
          onObjectChange={handleTransformChange}
          mode="translate"
        />
      )}
    </>
  );
};

// Add this type for Three.js intersection events
interface ThreeEvent extends THREE.Event {
  intersections: THREE.Intersection[];
  stopped: boolean;
}

const CharacterEditor: React.FC = () => {
  const [objects, setObjects] = useState<SceneObject[]>([
    {
      id: "floor",
      shape: "plane",
      position: [0, -2, 0],
      rotation: [-Math.PI / 2, 0, 0],
      scale: [10, 10, 1],
      color: "#666666",
    },
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedShape, setSelectedShape] =
    useState<keyof typeof AVAILABLE_SHAPES>("box");
  const [lights, setLights] = useState<SceneLight[]>([
    {
      id: "ambient-1",
      type: "ambient",
      intensity: 0.2,
      color: "#ffffff",
    },
    {
      id: "directional-1",
      type: "directional",
      position: [5, 10, 5],
      intensity: 1.5,
      color: "#ffffff",
    },
  ]);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(true);

  // Use the history hook
  const {
    state: historyState,
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(objects);

  // Use the keyboard controls hook
  useKeyboardControls(
    selectedIds,
    setObjects,
    setSelectedIds,
    selectedLightId,
    setLights,
    setSelectedLightId
  );

  const addObject = () => {
    const newObject: SceneObject = {
      id: `object-${Date.now()}`,
      shape: selectedShape,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#ffffff",
    };
    setObjects((prev) => [...prev, newObject]);
    pushHistory([...objects, newObject]); // Push new state to history
  };

  const deleteSelected = () => {
    setObjects((prev) => prev.filter((obj) => !selectedIds.includes(obj.id)));
    setSelectedIds([]);
  };

  const resetSelected = () => {
    setObjects((prev) =>
      prev.map((obj) =>
        selectedIds.includes(obj.id)
          ? {
              ...obj,
              position: [0, 1, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
            }
          : obj
      )
    );
  };

  const updateObjectColor = (color: string) => {
    setObjects((prev) =>
      prev.map((obj) =>
        selectedIds.includes(obj.id) ? { ...obj, color } : obj
      )
    );
  };

  const handleCanvasClick = useCallback(
    (event: THREE.Event) => {
      console.log("event", event);
      if (event.intersections?.length === 0) return;

      const intersection = event.intersections[0];
      const { point } = intersection;

      const newObject: SceneObject = {
        id: `object-${Date.now()}`,
        shape: selectedShape,
        position: [
          Math.round(point.x),
          Math.round(point.y),
          Math.round(point.z),
        ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: "#ffffff",
      };

      setObjects([...objects, newObject]);
    },
    [selectedShape, objects]
  );

  const handleCanvasDoubleClick = useCallback(
    (event: THREE.Event) => {
      if (event.intersections.length === 0) return;

      const intersection = event.intersections[0];
      const { point } = intersection;

      // Find the clicked object
      const clickedObject = objects.find((obj) => {
        // Logic to determine if the clicked point is on the object
        // This may involve checking the object's geometry and the intersection point
        return obj; // Replace with actual logic to check intersection
      });

      if (clickedObject) {
        // Calculate the new position based on the clicked face
        const newPosition = calculateSnapPosition(clickedObject, point);

        const newObject: SceneObject = {
          id: `object-${Date.now()}`,
          shape: clickedObject.shape,
          position: newPosition,
          rotation: clickedObject.rotation,
          scale: clickedObject.scale,
          color: clickedObject.color,
        };

        setObjects((prev) => [...prev, newObject]);
      }
    },
    [objects]
  );

  const duplicateSelected = () => {
    const newObjects = selectedIds
      .map((id) => {
        const selectedObject = objects.find((obj) => obj.id === id);
        if (selectedObject) {
          return {
            ...selectedObject,
            id: `object-${Date.now()}`,
            position: [
              selectedObject.position[0] + 1,
              selectedObject.position[1],
              selectedObject.position[2],
            ], // Offset to avoid overlap
          };
        }
        return null;
      })
      .filter(Boolean) as SceneObject[];

    setObjects((prev) => [...prev, ...newObjects]);
  };

  const groupSelected = () => {
    if (selectedIds.length === 0) return;

    const groupedObject: SceneObject = {
      id: `group-${Date.now()}`,
      shape: "group",
      position: [0, 0, 0], // Set to the average position of selected objects
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#ffffff",
    };

    // Calculate average position for the group
    const positions = selectedIds.map((id) => {
      const obj = objects.find((o) => o.id === id);
      return obj ? obj.position : [0, 0, 0];
    });

    const averagePosition = positions
      .reduce(
        (acc, pos) => {
          acc[0] += pos[0];
          acc[1] += pos[1];
          acc[2] += pos[2];
          return acc;
        },
        [0, 0, 0]
      )
      .map((p) => p / selectedIds.length) as [number, number, number];

    groupedObject.position = averagePosition;

    setObjects((prev) => [...prev, groupedObject]);
    deleteSelected(); // Remove individual objects after grouping
  };

  const saveScene = () => {
    localStorage.setItem("savedScene", JSON.stringify(objects));
  };

  const loadScene = () => {
    const savedScene = localStorage.getItem("savedScene");
    if (savedScene) {
      setObjects(JSON.parse(savedScene));
    }
  };

  const updateMaterial = (key: string, value: number) => {
    setObjects((prev) =>
      prev.map((obj) =>
        selectedIds.includes(obj.id)
          ? { ...obj, [key]: value } // Dynamically update property
          : obj
      )
    );
  };

  // Add light management functions
  const addLight = (type: SceneLight["type"]) => {
    const newLight: SceneLight = {
      id: `${type}-${Date.now()}`,
      type,
      position: type !== "ambient" ? [0, 5, 0] : undefined,
      intensity: 1,
      color: "#ffffff",
    };
    setLights((prev) => [...prev, newLight]);
  };

  const updateLight = (id: string, updates: Partial<SceneLight>) => {
    setLights((prev) =>
      prev.map((light) => (light.id === id ? { ...light, ...updates } : light))
    );
  };

  const deleteLight = (id: string) => {
    setLights((prev) => prev.filter((light) => light.id !== id));
    setSelectedLightId(null);
  };

  useEffect(() => {
    const handleToolsToggle = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t") {
        setShowTools((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleToolsToggle);
    return () => {
      window.removeEventListener("keydown", handleToolsToggle);
    };
  }, []);

  // Update the selection handler
  const handleObjectSelect = useCallback((objId: string, event: ThreeEvent) => {
    event.stopPropagation();
    if (!event.shiftKey) {
      setSelectedIds([objId]);
    } else {
      setSelectedIds((prev) => {
        if (prev.includes(objId)) {
          return prev.filter((id) => id !== objId);
        } else {
          return [...prev, objId];
        }
      });
    }
  }, []);

  const handleObjectDeselect = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const calculateSnapPosition = (
    sourceObj: SceneObject,
    intersectionPoint: THREE.Vector3
  ): [number, number, number] => {
    // Round to nearest integer for grid snapping
    return [
      Math.round(intersectionPoint.x),
      Math.round(intersectionPoint.y),
      Math.round(intersectionPoint.z),
    ];
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute z-10 p-4 bg-white dark:bg-gray-800 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <label className="text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={showTools}
              onChange={() => setShowTools(!showTools)}
              className="mr-2"
            />
            Tools
          </label>
        </div>

        <div
          className={`transition-transform duration-300 transform max-w-[30vw] ${
            showTools ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {showTools && (
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedShape}
                onChange={(e) =>
                  setSelectedShape(
                    e.target.value as keyof typeof AVAILABLE_SHAPES
                  )
                }
                className="mb-2 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
              >
                {Object.keys(AVAILABLE_SHAPES).map((shape) => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={addObject}
                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Object
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.length === 0}
                className="mb-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Selected
              </button>
              <button
                onClick={resetSelected}
                disabled={selectedIds.length === 0}
                className="mb-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset Selected
              </button>
              {selectedIds.length > 0 && (
                <input
                  type="color"
                  value={
                    objects.find((obj) => obj.id === selectedIds[0])?.color ||
                    "#ffffff"
                  }
                  onChange={(e) => updateObjectColor(e.target.value)}
                  className="mb-2"
                />
              )}
              <button
                onClick={duplicateSelected}
                disabled={selectedIds.length === 0}
                className="mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Duplicate Selected
              </button>
              <button
                onClick={groupSelected}
                disabled={selectedIds.length < 2}
                className="mb-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Group Selected
              </button>
              <button
                onClick={undo}
                disabled={canUndo}
                className="mb-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={canRedo}
                className="mb-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Redo
              </button>
              <button
                onClick={saveScene}
                className="mb-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Save Scene
              </button>
              <button
                onClick={loadScene}
                className="mb-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Load Scene
              </button>
              {selectedIds.length > 0 && (
                <>
                  <label className="block text-gray-800 dark:text-gray-200">
                    Metalness:
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    onChange={(e) =>
                      updateMaterial("metalness", parseFloat(e.target.value))
                    }
                    className="mb-2"
                  />
                  <label className="block text-gray-800 dark:text-gray-200">
                    Roughness:
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    onChange={(e) =>
                      updateMaterial("roughness", parseFloat(e.target.value))
                    }
                    className="mb-2"
                  />
                </>
              )}
              <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Lighting
                </h3>
                <button
                  onClick={() => addLight("point")}
                  className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Point Light
                </button>
                <button
                  onClick={() => addLight("directional")}
                  className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Directional Light
                </button>
                <button
                  onClick={() => addLight("spot")}
                  className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Spot Light
                </button>

                {selectedLightId && (
                  <div>
                    <input
                      type="color"
                      value={
                        lights.find((l) => l.id === selectedLightId)?.color ||
                        "#ffffff"
                      }
                      onChange={(e) =>
                        updateLight(selectedLightId, { color: e.target.value })
                      }
                      className="mb-2"
                    />
                    <label className="block text-gray-800 dark:text-gray-200">
                      Intensity:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={
                        lights.find((l) => l.id === selectedLightId)
                          ?.intensity || 1
                      }
                      onChange={(e) =>
                        updateLight(selectedLightId, {
                          intensity: parseFloat(e.target.value),
                        })
                      }
                      className="mb-2"
                    />
                    <button
                      onClick={() => deleteLight(selectedLightId)}
                      className="mb-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Light
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [4, 4, 4], fov: 50 }}
        onClick={(event: ThreeEvent) => {
          // Only clear selection if clicking on empty space
          console.log("event", event);
          if (!event.stopped && event.intersections?.length === 0) {
            setSelectedIds([]);
            setSelectedLightId(null);
          }
        }}
        onDoubleClick={(event: ThreeEvent) => {
          if (event.intersections.length > 0) {
            const intersection = event.intersections[0];
            const clickedObject = intersection.object;

            // Find the corresponding object in our state
            const sourceObject = objects.find(
              (obj) => obj.id === clickedObject.userData.id
            );

            if (sourceObject) {
              const newPosition = calculateSnapPosition(
                sourceObject,
                intersection.point
              );

              const newObject: SceneObject = {
                ...sourceObject,
                id: `object-${Date.now()}`,
                position: newPosition,
              };

              setObjects((prev) => [...prev, newObject]);
              setSelectedIds([newObject.id]);
            }
          }
        }}
      >
        <color attach="background" args={["#202020"]} />
        <Physics>
          {lights.map((light) => (
            <Light
              key={light.id}
              light={light}
              selected={selectedLightId === light.id}
              onSelect={() => {
                setSelectedLightId(light.id);
                setSelectedIds([]); // Clear object selection when selecting a light
              }}
              onDeselect={() => setSelectedLightId(null)}
              onUpdate={(updates) => updateLight(light.id, updates)}
            />
          ))}
          {objects.map((obj) => (
            <Geometry
              key={obj.id}
              obj={obj}
              selected={selectedIds.includes(obj.id)}
              onSelect={(e: ThreeEvent) => handleObjectSelect(obj.id, e)}
              onDeselect={() => setSelectedIds([])}
            />
          ))}
        </Physics>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default CharacterEditor;

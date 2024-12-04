import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { TransformControls as TransformControlsImpl } from "three/examples/jsm/controls/TransformControls";
import { useThree } from "@react-three/fiber";

// Extend Three.js with TransformControls
extend({ TransformControls: TransformControlsImpl });

// Define available shapes
export const AVAILABLE_SHAPES = {
  box: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.5, 32, 32]} />,
  cone: <coneGeometry args={[0.5, 1, 32]} />,
  cylinder: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
  torus: <torusGeometry args={[0.5, 0.2, 16, 100]} />,
  plane: <planeGeometry args={[1, 1]} />,
};

export interface SceneObject extends GeometryProps {
  id: string;
  shape: keyof typeof AVAILABLE_SHAPES;
}

interface Group {
  memberIds: string[];
}

interface GeometryProps {
  obj: SceneObject;
  selected: boolean;
  onSelect: (e: any) => void;
  onDeselect: () => void;
  setObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  groups: Group[];
  isMultiSelectMode: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  transformMode: TransformMode;
}

// Add transform mode type
type TransformMode = "translate" | "rotate" | "scale";

export const Geometry: React.FC<GeometryProps> = ({
  obj,
  selected,
  onSelect,
  onDeselect,
  setObjects,
  setSelectedIds,
  groups,
  isMultiSelectMode,
  transformMode,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const originalPosition = useRef(obj.position);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setIsAltPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setIsAltPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleObjectChange = (event) => {
    if (meshRef.current) {
      const newPosition = meshRef.current.position.toArray() as [
        number,
        number,
        number
      ];
      const newRotation = meshRef.current.rotation.toArray().slice(0, 3) as [
        number,
        number,
        number
      ];
      const newScale = meshRef.current.scale.toArray() as [
        number,
        number,
        number
      ];

      // Find if object is part of any selected group
      const selectedGroup = groups.find((group) =>
        group.memberIds.includes(obj.id)
      );

      if (selectedGroup) {
        // Update all objects in the group
        setObjects((prev) =>
          prev.map((o) => {
            if (selectedGroup.memberIds.includes(o.id)) {
              if (transformMode === "translate") {
                // Calculate offset from group center
                const offset = [
                  newPosition[0] - obj.position[0],
                  newPosition[1] - obj.position[1],
                  newPosition[2] - obj.position[2],
                ];

                return {
                  ...o,
                  position: [
                    o.position[0] + offset[0],
                    o.position[1] + offset[1],
                    o.position[2] + offset[2],
                  ] as [number, number, number],
                };
              } else if (transformMode === "rotate") {
                return { ...o, rotation: newRotation };
              } else if (transformMode === "scale") {
                return { ...o, scale: newScale };
              }
            }
            return o;
          })
        );
      } else {
        // Update single object
        setObjects((prev) =>
          prev.map((o) => {
            if (o.id === obj.id) {
              const updates = {
                position:
                  transformMode === "translate" ? newPosition : o.position,
                rotation: transformMode === "rotate" ? newRotation : o.rotation,
                scale: transformMode === "scale" ? newScale : o.scale,
              };
              return { ...o, ...updates };
            }
            return o;
          })
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && isAltPressed && meshRef.current) {
      const newPosition = meshRef.current.position.toArray() as [
        number,
        number,
        number
      ];

      const newObject = {
        ...obj,
        id: `object-${Date.now()}`,
        position: [
          Math.round(newPosition[0]),
          Math.round(newPosition[1]),
          Math.round(newPosition[2]),
        ],
      };

      setObjects((prev) => {
        const updated = prev.map((o) => {
          if (o.id === obj.id) {
            return { ...o, position: originalPosition.current };
          }
          return o;
        });
        return [...updated, newObject];
      });

      setSelectedIds([newObject.id]);
      setIsDragging(false);
    }
  };

  const calculateSnapPosition = (
    sourceObj: SceneObject,
    intersectionPoint: THREE.Vector3,
    normal: THREE.Vector3
  ): [number, number, number] => {
    // Get the dimensions of the source object (assuming it's a box)
    const sourceSize = new THREE.Vector3(1, 1, 1).multiply(
      new THREE.Vector3(...sourceObj.scale)
    );

    // Calculate offset based on the object dimensions and normal
    const offset = new THREE.Vector3(
      Math.abs(normal.x) * sourceSize.x,
      Math.abs(normal.y) * sourceSize.y,
      Math.abs(normal.z) * sourceSize.z
    );

    // Calculate the position that will make the objects flush
    const sourcePosition = new THREE.Vector3(...sourceObj.position);
    const newPosition = sourcePosition
      .clone()
      .add(normal.clone().multiply(offset));

    // Round to nearest integer for grid snapping
    return [
      Math.round(newPosition.x),
      Math.round(newPosition.y),
      Math.round(newPosition.z),
    ];
  };

  return (
    <>
      {selected && (
        <mesh
          position={obj.position}
          rotation={obj.rotation}
          scale={[
            obj.scale[0] * 1.05,
            obj.scale[1] * 1.05,
            obj.scale[2] * 1.05,
          ]}
        >
          {AVAILABLE_SHAPES[obj.shape]}
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        userData={{ id: obj.id }}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
        onPointerMissed={(e) => {
          if (!isMultiSelectMode) {
            onDeselect();
          }
        }}
      >
        {AVAILABLE_SHAPES[obj.shape]}
        <meshPhysicalMaterial
          color={obj.color}
          metalness={obj.metalness}
          roughness={obj.roughness}
        />
      </mesh>
      {selected && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={handleObjectChange}
          onMouseUp={handleMouseUp}
        />
      )}
    </>
  );
};

export default Geometry;

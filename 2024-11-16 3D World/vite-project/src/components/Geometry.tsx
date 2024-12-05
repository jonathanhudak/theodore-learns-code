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
  onDuplicate?: (position: THREE.Vector3, objectId: string) => void;
  sceneOffset: [number, number, number];
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
  onDuplicate,
  sceneOffset,
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
      // Get the world position and convert to local coordinates
      const worldPosition = meshRef.current.position.clone();
      const localPosition = [
        Math.round(worldPosition.x - sceneOffset[0]),
        Math.round(worldPosition.y - sceneOffset[1]),
        Math.round(worldPosition.z - sceneOffset[2])
      ] as [number, number, number];

      setObjects((prev) =>
        prev.map((o) => {
          if (o.id === obj.id) {
            return { 
              ...o, 
              position: localPosition,
              rotation: meshRef.current!.rotation.toArray().slice(0, 3) as [number, number, number],
              scale: meshRef.current!.scale.toArray() as [number, number, number]
            };
          }
          return o;
        })
      );
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
    normal: THREE.Vector3,
    face: THREE.Face
  ): [number, number, number] => {
    if (!meshRef.current) return [0, 0, 0];

    // Get the box dimensions
    const boxSize = new THREE.Vector3(1, 1, 1).multiply(
      new THREE.Vector3(...sourceObj.scale)
    );

    // Get the clicked object's world position
    const objectWorldPos = new THREE.Vector3(...sourceObj.position)
      .add(new THREE.Vector3(...sceneOffset));

    // Determine which face was clicked based on the normal
    let faceCenter = objectWorldPos.clone();
    if (Math.abs(normal.x) > 0.5) {
      // Side face (X)
      faceCenter.x += normal.x * boxSize.x * 0.5;
    } else if (Math.abs(normal.y) > 0.5) {
      // Top/bottom face (Y)
      faceCenter.y += normal.y * boxSize.y * 0.5;
    } else if (Math.abs(normal.z) > 0.5) {
      // Front/back face (Z)
      faceCenter.z += normal.z * boxSize.z * 0.5;
    }

    // Calculate new position by moving one unit in the normal direction
    const newPosition = faceCenter.clone()
      .add(normal);

    console.log('Snap calculation:', {
      boxSize: boxSize.toArray(),
      objectWorldPos: objectWorldPos.toArray(),
      normal: normal.toArray(),
      faceCenter: faceCenter.toArray(),
      newPosition: newPosition.toArray(),
      sceneOffset
    });

    // Convert to local coordinates
    return [
      Math.round(newPosition.x - sceneOffset[0]),
      Math.round(newPosition.y - sceneOffset[1]),
      Math.round(newPosition.z - sceneOffset[2])
    ];
  };

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!onDuplicate || !meshRef.current) return;
    
    const intersection = event.intersections?.[0];
    if (!intersection?.face) {
      console.log("No valid intersection found", event.intersections);
      return;
    }

    // Get the face normal in world space
    const worldNormal = intersection.face.normal.clone()
      .applyQuaternion(meshRef.current.quaternion)
      .normalize();

    console.log('Double click data:', {
      intersectionPoint: intersection.point.toArray(),
      worldNormal: worldNormal.toArray(),
      sourcePosition: obj.position,
      sceneOffset,
      objectScale: obj.scale,
      faceIndex: intersection.faceIndex,
      face: {
        a: intersection.face.a,
        b: intersection.face.b,
        c: intersection.face.c
      }
    });

    // Calculate snap position
    const snapPosition = calculateSnapPosition(
      obj,
      intersection.point,
      worldNormal,
      intersection.face
    );

    console.log('Calculated snap position:', snapPosition);

    // Create Vector3 from snap position
    const position = new THREE.Vector3(...snapPosition);
    onDuplicate(position, obj.id);
  };

  return (
    <>
      {selected && (
        <mesh
          position={[
            obj.position[0] + sceneOffset[0],
            obj.position[1] + sceneOffset[1],
            obj.position[2] + sceneOffset[2]
          ]}
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
        position={[
          obj.position[0] + sceneOffset[0],
          obj.position[1] + sceneOffset[1],
          obj.position[2] + sceneOffset[2]
        ]}
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
        onDoubleClick={handleDoubleClick}
      >
        {AVAILABLE_SHAPES[obj.shape]}
        <meshPhysicalMaterial
          color={obj.color}
          metalness={obj.metalness}
          roughness={obj.roughness}
        />
      </mesh>
      {selected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={handleObjectChange}
          onMouseUp={handleMouseUp}
          space="world"
          showX={true}
          showY={true}
          showZ={true}
        />
      )}
    </>
  );
};

export default Geometry;

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";

// Define available shapes
export const AVAILABLE_SHAPES = {
  box: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.5, 32, 32]} />,
  cone: <coneGeometry args={[0.5, 1, 32]} />,
  cylinder: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
  torus: <torusGeometry args={[0.5, 0.2, 16, 100]} />,
  plane: <planeGeometry args={[1, 1]} />,
};

// Define types
export interface GeometryProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}

export interface SceneObject extends GeometryProps {
  id: string;
  shape: keyof typeof AVAILABLE_SHAPES;
}

interface TransformControlsRef {
  attach: (obj: THREE.Object3D) => void;
  detach: () => void;
}

interface GeometryProps {
  obj: SceneObject;
  selected: boolean;
  onSelect: (event: THREE.Event) => void;
  onDeselect: () => void;
}

const Geometry: React.FC<GeometryProps> = ({
  obj,
  selected,
  onSelect,
  onDeselect,
}) => {
  const meshRef = useRef();
  const transformRef = useRef();

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
        onClick={onSelect}
        onPointerMissed={onDeselect}
      >
        {AVAILABLE_SHAPES[obj.shape]}
        <meshPhysicalMaterial
          color={obj.color}
          metalness={obj.metalness}
          roughness={obj.roughness}
          clearcoat={0.3}
          reflectivity={0.6}
        />
      </mesh>
      {selected && <TransformControls ref={transformRef} mode="translate" />}
    </>
  );
};

export default Geometry;

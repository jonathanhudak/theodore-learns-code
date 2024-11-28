import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { TransformControls } from "three/examples/jsm/transform/TransformControls";
import * as THREE from "three";

const TransformableObject = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<TransformControls>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    if (meshRef.current && controlsRef.current) {
      controlsRef.current.attach(meshRef.current);
    }
  }, [meshRef.current]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <transformControls
        ref={controlsRef}
        args={[cameraRef.current, meshRef.current]}
        mode="translate" // or "rotate", "scale"
      />
    </>
  );
};

export default TransformableObject;

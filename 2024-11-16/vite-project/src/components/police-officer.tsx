"use client";

import { useRef } from "react";
import { Mesh, Group, Shape, ExtrudeGeometry, CylinderGeometry } from "three";
import { useFrame } from "@react-three/fiber";

export function PoliceOfficer() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Add subtle idle animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  // Create a custom shield-shaped badge
  const badgeShape = new Shape();
  badgeShape.moveTo(0, 0.15);
  badgeShape.bezierCurveTo(0.1, 0.15, 0.1, 0.05, 0.1, 0);
  badgeShape.lineTo(0, -0.15);
  badgeShape.lineTo(-0.1, 0);
  badgeShape.bezierCurveTo(-0.1, 0.05, -0.1, 0.15, 0, 0.15);

  const extrudeSettings = {
    steps: 2,
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
  };

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.8, 1.4, 0.4]} />
        <meshStandardMaterial color="#0047AB" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Eyes */}
      <group position={[0, 1.7, 0.25]}>
        {/* Left eye */}
        <mesh position={[-0.1, 0, 0]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.1, 0, 0]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Smile */}
      <mesh position={[0, 1.58, 0.29]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.02, 16, 100, Math.PI]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      {/* Police Cap */}
      <mesh position={[0, 2, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>

      {/* Badge */}
      <mesh
        position={[0, 0.9, 0.21]}
        rotation={[0, 0, Math.PI]}
        scale={[1.5, 1.5, 1.5]}
      >
        <extrudeGeometry args={[badgeShape, extrudeSettings]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.5, 0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#0047AB" />
      </mesh>
      <mesh position={[0.5, 0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#0047AB" />
      </mesh>
    </group>
  );
}

import React from "react";
import { RigidBody } from "@react-three/rapier";

const House = ({ position }) => {
  return (
    <RigidBody type="fixed" position={position}>
      <group>
        <RigidBody type="fixed">
          <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[2, 1.5, 2]} />
            <meshStandardMaterial color="#e6e6e6" />
          </mesh>
        </RigidBody>
        <mesh castShadow receiveShadow position={[0, 1.75, 0]}>
          <coneGeometry args={[1.5, 1, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 1.01]}>
          <boxGeometry args={[0.5, 1, 0.05]} />
          <meshStandardMaterial color="#4d2600" />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.5, 1, 1.01]}>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial color="#87ceeb" />
        </mesh>
        <mesh castShadow receiveShadow position={[0.5, 1, 1.01]}>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial color="#87ceeb" />
        </mesh>
      </group>
    </RigidBody>
  );
};

export default House;

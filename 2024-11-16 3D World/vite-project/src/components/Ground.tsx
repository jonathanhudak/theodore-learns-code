import React from "react";
import { RigidBody } from "@react-three/rapier";

const Ground = () => {
  return (
    <RigidBody type="fixed">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#8a8" />
      </mesh>
    </RigidBody>
  );
};

export default Ground;

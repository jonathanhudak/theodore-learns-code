import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

const Tree = ({ position }) => {
  return (
    <RigidBody type="fixed" position={position}>
      <group>
        <mesh castShadow position={[0, 2, 0]}>
          <coneGeometry args={[1, 4, 8]} />
          <meshStandardMaterial color="darkgreen" />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 1]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        <CuboidCollider args={[0.2, 2, 0.2]} position={[0, 2, 0]} />
      </group>
    </RigidBody>
  );
};

export default Tree;

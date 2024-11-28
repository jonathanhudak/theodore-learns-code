import React from "react";

const Building = ({ position, scale = [1, 1, 1], color = "gray" }) => {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Building;

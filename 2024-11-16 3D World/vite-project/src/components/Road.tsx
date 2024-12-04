import React from "react";

const Road = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[10, 100]} />
      <meshStandardMaterial color="#3a404a" />
    </mesh>
  );
};

export default Road;

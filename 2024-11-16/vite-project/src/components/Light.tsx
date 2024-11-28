import React from "react";

const Light = () => {
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight intensity={0.5} groundColor="#b9b9b9" color="#ffffff" />
    </>
  );
};

export default Light;

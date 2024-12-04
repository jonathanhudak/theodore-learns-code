import React, { useEffect, useState } from "react";

const PoleWithBell = () => {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsLit((prev) => !prev);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <group position={[0, 5, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.2, 0.05, 16, 100, Math.PI]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
      <group position={[0, 4.7, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.4, 32]} />
          <meshStandardMaterial
            color={isLit ? "#FFFF00" : "#B8860B"}
            emissive={isLit ? "#FFFF00" : "#000000"}
            emissiveIntensity={isLit ? 1 : 0}
          />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
    </group>
  );
};

export default PoleWithBell;

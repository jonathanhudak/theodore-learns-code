import React from "react";
import { RigidBody } from "@react-three/rapier";
import { Center, Text3D, useMatcapTexture } from "@react-three/drei";

const PoliceStation = ({ position = [-15, 0, 0] }) => {
  const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91");

  return (
    <RigidBody type="fixed" position={position}>
      <group>
        <mesh castShadow receiveShadow position={[0, 6, 0]}>
          <boxGeometry args={[12, 12, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 2, 4.1]}>
          <boxGeometry args={[2, 4, 0.2]} />
          <meshStandardMaterial color="#000080" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 4.5]}>
          <boxGeometry args={[6, 1, 1]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        <mesh position={[0, 10, 4.1]} castShadow>
          <boxGeometry args={[8, 2, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Center position={[0, 10, 4.25]}>
          <Text3D
            font="/fonts/arial-bold.json"
            size={1}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            POLICE
            <meshMatcapMaterial color="black" matcap={matcapTexture} />
          </Text3D>
        </Center>
        <mesh castShadow receiveShadow position={[-8, 4, 0]}>
          <boxGeometry args={[4, 8, 8]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
        <group position={[-8, 2, 4.1]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 4.2, 0.3]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.1]}>
            <boxGeometry args={[2, 4, 0.1]} />
            <meshStandardMaterial
              color="#606060"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.2]} castShadow>
              <boxGeometry args={[0.1, 4, 0.1]} />
              <meshStandardMaterial color="#303030" metalness={0.8} />
            </mesh>
          ))}
          {[-1.6, -0.8, 0, 0.8, 1.6].map((y, i) => (
            <mesh key={i} position={[0, y, 0.2]} castShadow>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color="#303030" metalness={0.8} />
            </mesh>
          ))}
        </group>
        {[-9, -8, -7].map((x, i) => (
          <group key={i} position={[x, 6, 4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 1.2, 0.3]} />
              <meshStandardMaterial color="#404040" />
            </mesh>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((wx, j) => (
              <mesh key={j} position={[wx, 0, 0.2]} castShadow>
                <boxGeometry args={[0.08, 1.2, 0.08]} />
                <meshStandardMaterial color="#303030" metalness={0.8} />
              </mesh>
            ))}
            {[-0.4, 0, 0.4].map((wy, j) => (
              <mesh key={j} position={[0, wy, 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.08, 0.08]} />
                <meshStandardMaterial color="#303030" metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}
        <Center position={[-10, 8, 4.25]}>
          <Text3D
            font="/fonts/arial-bold.json"
            size={0.8}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            JAIL
            <meshMatcapMaterial color="black" matcap={matcapTexture} />
          </Text3D>
        </Center>
        <mesh position={[0, 12.5, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1]} />
          <meshStandardMaterial
            color="#0000ff"
            emissive="#0000ff"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-5.5, 12, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      </group>
    </RigidBody>
  );
};

export default PoliceStation;

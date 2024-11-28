"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Sky,
  useTexture,
  PointerLockControls,
  Text3D,
  Center,
  useMatcapTexture,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Physics,
  RigidBody,
  CapsuleCollider,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";

function Ground() {
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
}

function Building({ position, scale = [1, 1, 1], color = "gray" }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function House({ position }) {
  return (
    <RigidBody type="fixed" position={position}>
      <group>
        {/* Main house structure with collision */}
        <RigidBody type="fixed">
          <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[2, 1.5, 2]} />
            <meshStandardMaterial color="#e6e6e6" />
          </mesh>
        </RigidBody>
        {/* Roof */}
        <mesh castShadow receiveShadow position={[0, 1.75, 0]}>
          <coneGeometry args={[1.5, 1, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        {/* Door */}
        <mesh castShadow receiveShadow position={[0, 0.5, 1.01]}>
          <boxGeometry args={[0.5, 1, 0.05]} />
          <meshStandardMaterial color="#4d2600" />
        </mesh>
        {/* Windows */}
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
}

function Tree({ position }) {
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
        {/* Add invisible collision cylinder for the trunk */}
        <CuboidCollider args={[0.2, 2, 0.2]} position={[0, 2, 0]} />
      </group>
    </RigidBody>
  );
}

function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[10, 100]} />
      <meshStandardMaterial color="#3a404a" />
    </mesh>
  );
}

function PoleWithBell() {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsLit((prev) => !prev);
    }, 1000); // Changed from 3000 to 1000 for 1-second interval

    return () => clearInterval(intervalId);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Brown box */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Pole */}
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Hook */}
      <group position={[0, 5, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.2, 0.05, 16, 100, Math.PI]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
      {/* Bell */}
      <group position={[0, 4.7, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.4, 32]} />
          <meshStandardMaterial
            color={isLit ? "#FFFF00" : "#B8860B"} // Changed from #FFD700 to #FFFF00 for brighter yellow
            emissive={isLit ? "#FFFF00" : "#000000"}
            emissiveIntensity={isLit ? 1 : 0} // Increased from 0.5 to 1 for maximum brightness
          >
            <meshPhongMaterial shininess={100} />{" "}
            {/* Added for faster light response */}
          </meshStandardMaterial>
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
    </group>
  );
}

function PoliceStation({ position = [-15, 0, 0] }) {
  const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91");

  return (
    <RigidBody type="fixed" position={position}>
      <group>
        {/* Main building structure */}
        <mesh castShadow receiveShadow position={[0, 6, 0]}>
          <boxGeometry args={[12, 12, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Main Police Station Door */}
        <mesh castShadow receiveShadow position={[0, 2, 4.1]}>
          <boxGeometry args={[2, 4, 0.2]} />
          <meshStandardMaterial color="#000080" />
        </mesh>

        {/* Front steps */}
        <mesh castShadow receiveShadow position={[0, 0.5, 4.5]}>
          <boxGeometry args={[6, 1, 1]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>

        {/* POLICE Sign Background */}
        <mesh position={[0, 10, 4.1]} castShadow>
          <boxGeometry args={[8, 2, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* POLICE Text */}
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

        {/* Jail Wing - on the left side */}
        <mesh castShadow receiveShadow position={[-8, 4, 0]}>
          <boxGeometry args={[4, 8, 8]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>

        {/* Jail Door - centered on jail wing */}
        <group position={[-8, 2, 4.1]}>
          {/* Door frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 4.2, 0.3]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
          {/* Metal door */}
          <mesh castShadow receiveShadow position={[0, 0, 0.1]}>
            <boxGeometry args={[2, 4, 0.1]} />
            <meshStandardMaterial
              color="#606060"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Jail bars */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.2]} castShadow>
              <boxGeometry args={[0.1, 4, 0.1]} />
              <meshStandardMaterial color="#303030" metalness={0.8} />
            </mesh>
          ))}
          {/* Horizontal bars */}
          {[-1.6, -0.8, 0, 0.8, 1.6].map((y, i) => (
            <mesh key={i} position={[0, y, 0.2]} castShadow>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color="#303030" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Jail Windows - centered on jail wing */}
        {[-9, -8, -7].map((x, i) => (
          <group key={i} position={[x, 6, 4]}>
            {/* Window frame */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 1.2, 0.3]} />
              <meshStandardMaterial color="#404040" />
            </mesh>
            {/* Vertical bars */}
            {[-0.4, -0.2, 0, 0.2, 0.4].map((wx, j) => (
              <mesh key={j} position={[wx, 0, 0.2]} castShadow>
                <boxGeometry args={[0.08, 1.2, 0.08]} />
                <meshStandardMaterial color="#303030" metalness={0.8} />
              </mesh>
            ))}
            {/* Horizontal bars */}
            {[-0.4, 0, 0.4].map((wy, j) => (
              <mesh key={j} position={[0, wy, 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.08, 0.08]} />
                <meshStandardMaterial color="#303030" metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* JAIL Text */}
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

        {/* Blue light on top */}
        <mesh position={[0, 12.5, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1]} />
          <meshStandardMaterial
            color="#0000ff"
            emissive="#0000ff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Flag pole */}
        <mesh position={[-5.5, 12, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      </group>
    </RigidBody>
  );
}

// First, make sure houses array is accessible
const houses: [number, number, number][] = [
  [-10, 0, -10],
  [10, 0, -10],
  [-10, 0, 10],
  [10, 0, 10],
  // Add more house positions as needed
];

function Robber({
  initialPosition,
}: {
  initialPosition: [number, number, number];
}) {
  const robberRef = useRef<RapierRigidBody>(null);
  const [targetHouse, setTargetHouse] = useState<
    [number, number, number] | null
  >(null);
  const [state, setState] = useState<
    "wandering" | "targeting" | "stealing" | "fleeing"
  >("wandering");

  useFrame((state, delta) => {
    if (!robberRef.current) return;

    const position = robberRef.current.translation();
    const moveDirection = new THREE.Vector3();

    switch (state) {
      case "wandering":
        // Randomly choose a house to target
        if (!targetHouse && Math.random() < 0.02) {
          const randomHouse = houses[Math.floor(Math.random() * houses.length)];
          setTargetHouse(randomHouse);
          setState("targeting");
        }
        // Random movement
        moveDirection.set(
          Math.sin(state.clock.elapsedTime * 0.5) * 0.5,
          0,
          Math.cos(state.clock.elapsedTime * 0.5) * 0.5
        );
        break;

      case "targeting":
        if (targetHouse) {
          // Move towards target house
          moveDirection
            .set(targetHouse[0] - position.x, 0, targetHouse[2] - position.z)
            .normalize();

          // Check if reached house
          const distanceToHouse = Math.sqrt(
            Math.pow(targetHouse[0] - position.x, 2) +
              Math.pow(targetHouse[2] - position.z, 2)
          );

          if (distanceToHouse < 2) {
            setState("stealing");
          }
        }
        break;

      case "stealing":
        // Stay at house for a bit, then flee
        if (Math.random() < 0.01) {
          setState("fleeing");
        }
        break;

      case "fleeing":
        // Run away from police station
        moveDirection
          .set(
            position.x - -15, // Run away from police station X
            0,
            position.z - 0 // Run away from police station Z
          )
          .normalize();

        // Reset if far enough away
        const distanceFromPolice = Math.sqrt(
          Math.pow(-15 - position.x, 2) + Math.pow(0 - position.z, 2)
        );

        if (distanceFromPolice > 30) {
          setTargetHouse(null);
          setState("wandering");
        }
        break;
    }

    // Apply movement using Rapier's setLinvel
    const moveSpeed = state === "fleeing" ? 8 : 4;
    robberRef.current.setLinvel(
      {
        x: moveDirection.x * moveSpeed,
        y: 0,
        z: moveDirection.z * moveSpeed,
      },
      true
    );

    // Update rotation
    if (moveDirection.length() > 0.1) {
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      const currentRotation = robberRef.current.rotation();
      robberRef.current.setRotation(
        { x: 0, y: angle, z: 0, w: Math.cos(angle / 2) },
        true
      );
    }
  });

  return (
    <RigidBody
      ref={robberRef}
      position={initialPosition}
      enabledRotations={[false, true, false]}
      type="dynamic"
      colliders="cuboid"
      mass={1}
      friction={0.5}
    >
      {/* Robber body */}
      <mesh castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Robber mask */}
      <mesh castShadow position={[0, 1.7, 0.2]}>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Robber bag */}
      <mesh castShadow position={[0.3, 1.2, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#553311" />
      </mesh>
    </RigidBody>
  );
}

function Neighborhood() {
  const trees = [
    [-25, 0, -25],
    [-22, 0, -20],
    [-24, 0, -15],
    [-23, 0, -10],
    [-25, 0, -5],
    [-22, 0, 0],
    [-24, 0, 5],
    [-23, 0, 10],
    [-25, 0, 15],
    [-22, 0, 20],
    [-24, 0, 25],

    [15, 0, -25],
    [12, 0, -20],
    [14, 0, -15],
    [13, 0, -10],
    [15, 0, -5],
    [12, 0, 0],
    [14, 0, 5],
    [13, 0, 10],
    [15, 0, 15],
    [12, 0, 20],
    [14, 0, 25],

    [-30, 0, -22],
    [-28, 0, -18],
    [-30, 0, -14],
    [-28, 0, -10],
    [-30, 0, -6],
    [-28, 0, -2],
    [-30, 0, 2],
    [-28, 0, 6],
    [-30, 0, 10],
    [-28, 0, 14],
    [-30, 0, 18],

    [20, 0, -22],
    [18, 0, -18],
    [20, 0, -14],
    [18, 0, -10],
    [20, 0, -6],
    [18, 0, -2],
    [20, 0, 2],
    [18, 0, 6],
    [20, 0, 10],
    [18, 0, 14],
    [20, 0, 18],
  ];

  const houses = [
    [-6, 0, -20],
    [-6, 0, -12],
    [-6, 0, -4],
    [6, 0, 4],
    [6, 0, 12],
    [6, 0, 20],
  ];

  // Define initial positions for robbers
  const robberPositions: [number, number, number][] = [
    [-30, 0, -30],
    [30, 0, 30],
    [-30, 0, 30],
    [30, 0, -30],
  ];

  return (
    <group>
      <Ground />
      <Road />
      <PoleWithBell />
      <PoliceStation />
      {trees.map((position, index) => (
        <Tree key={index} position={position} />
      ))}
      {houses.map((position, index) => (
        <House key={index} position={position} />
      ))}
      {robberPositions.map((position, index) => (
        <Robber key={index} initialPosition={position} />
      ))}
    </group>
  );
}

function Player() {
  const playerRef = useRef();
  const [cameraAngle, setCameraAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseX = useRef(0);

  // Add initial position
  const initialPosition = [0, 0, 0]; // You can adjust these values

  const speed = 0.15;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const { camera } = useThree();

  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsDragging(true);
      lastMouseX.current = e.clientX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMouseX.current;
        setCameraAngle((prev) => prev + deltaX * 0.01);
        lastMouseX.current = e.clientX;
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  useFrame((state) => {
    if (!playerRef.current) return;

    // Calculate movement direction
    frontVector.set(0, 0, Number(keys.moveBackward) - Number(keys.moveForward));
    sideVector.set(Number(keys.moveLeft) - Number(keys.moveRight), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);

    // Get the camera's rotation
    const cameraRotation = cameraAngle;

    // Apply camera rotation to movement
    const rotatedDirection = new THREE.Vector3(
      direction.x * Math.cos(cameraRotation) +
        direction.z * Math.sin(cameraRotation),
      0,
      direction.z * Math.cos(cameraRotation) -
        direction.x * Math.sin(cameraRotation)
    );

    // Update physics-based position
    if (playerRef.current) {
      const currentPosition = playerRef.current.translation();
      playerRef.current.setTranslation({
        x: currentPosition.x + rotatedDirection.x,
        y: currentPosition.y,
        z: currentPosition.z + rotatedDirection.z,
      });

      // Rotate player to face movement direction
      if (rotatedDirection.length() > 0.1) {
        const angle = Math.atan2(rotatedDirection.x, rotatedDirection.z);
        const currentRotation = playerRef.current.rotation();
        playerRef.current.setRotation(
          { x: 0, y: angle, z: 0, w: Math.cos(angle / 2) },
          true
        );
      }

      // Calculate camera position based on angle
      const cameraDistance = 8;
      const cameraHeight = 4;
      const cameraX =
        currentPosition.x + Math.sin(cameraAngle) * cameraDistance;
      const cameraZ =
        currentPosition.z + Math.cos(cameraAngle) * cameraDistance;

      // Update camera position
      camera.position.lerp(
        new THREE.Vector3(cameraX, currentPosition.y + cameraHeight, cameraZ),
        0.1
      );

      // Make camera look at player
      camera.lookAt(
        currentPosition.x,
        currentPosition.y + 1,
        currentPosition.z
      );
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      position={initialPosition}
      enabledRotations={[false, true, false]}
      type="dynamic"
      colliders="cuboid"
      mass={1}
      friction={0.5}
    >
      <CapsuleCollider args={[0.5, 0.3]} position={[0, 1, 0]} />
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#0000cc" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Face Features */}
      {/* Simple dot eyes */}
      <mesh position={[-0.08, 1.85, 0.22]} castShadow>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.08, 1.85, 0.22]} castShadow>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* NEW SIMPLIFIED SMILING MOUTH */}
      <group position={[0, 1.78, 0.22]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh
          position={[-0.06, 0.02, 0]}
          rotation={[0, 0, Math.PI / 4]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.02, 0.02]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh
          position={[0.06, 0.02, 0]}
          rotation={[0, 0, -Math.PI / 4]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.02, 0.02]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Police Hat */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.3]} />
        <meshStandardMaterial color="#000080" />
      </mesh>

      {/* Badge */}
      <mesh position={[0, 1.2, 0.31]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.01]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
    </RigidBody>
  );
}

const keys = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
};

export default function Component() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.moveForward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.moveBackward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.moveLeft = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.moveRight = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.moveForward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.moveBackward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.moveLeft = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.moveRight = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ position: [-6, 4, -6], fov: 60 }}>
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
        <hemisphereLight
          intensity={0.5}
          groundColor="#b9b9b9"
          color="#ffffff"
        />
        <Sky sunPosition={[100, 20, 100]} />
        <Physics>
          <Suspense fallback={null}>
            <Neighborhood />
            <Player />
          </Suspense>
        </Physics>
      </Canvas>
      <div className="absolute bottom-0 left-0 p-4 text-white bg-black bg-opacity-50 rounded-tr-lg">
        <p>Controls:</p>
        <ul className="list-disc list-inside">
          <li>WASD or Arrow Keys - Move</li>
          <li>Click and drag mouse - Rotate camera</li>
        </ul>
      </div>
    </div>
  );
}

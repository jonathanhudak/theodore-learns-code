import React, { useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { keys } from "../keys";

const Player = () => {
  const playerRef = useRef(null);

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

  useFrame(() => {
    if (!playerRef.current) return;

    const direction = new THREE.Vector3();
    const speed = 0.1; // Adjust speed as necessary

    if (keys.moveForward) direction.z -= speed;
    if (keys.moveBackward) direction.z += speed;
    if (keys.moveLeft) direction.x -= speed;
    if (keys.moveRight) direction.x += speed;

    // Apply movement
    playerRef.current.setTranslation({
      x: playerRef.current.translation().x + direction.x,
      y: playerRef.current.translation().y,
      z: playerRef.current.translation().z + direction.z,
    });
  });

  return (
    <RigidBody ref={playerRef} position={[0, 1, 0]} type="dynamic">
      <mesh>
        <capsuleGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#0000cc" />
      </mesh>
    </RigidBody>
  );
};

export default Player;

import React, { useRef, useState, useEffect } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

const houses: [number, number, number][] = [
  [-10, 0, -10],
  [10, 0, -10],
  [-10, 0, 10],
  [10, 0, 10],
];

const Robber = ({
  initialPosition,
}: {
  initialPosition: [number, number, number];
}) => {
  const robberRef = useRef<RapierRigidBody>(null);
  const [targetHouse, setTargetHouse] = useState<
    [number, number, number] | null
  >(null);
  const [state, setState] = useState<
    "wandering" | "targeting" | "stealing" | "fleeing"
  >("wandering");

  const clock = new THREE.Clock();

  useEffect(() => {
    const animate = () => {
      if (!robberRef.current) return;

      const delta = clock.getDelta();
      const position = robberRef.current.translation();
      const moveDirection = new THREE.Vector3();

      switch (state) {
        case "wandering":
          if (!targetHouse && Math.random() < 0.02) {
            const randomHouse =
              houses[Math.floor(Math.random() * houses.length)];
            setTargetHouse(randomHouse);
            setState("targeting");
          }
          moveDirection.set(
            Math.sin(clock.getElapsedTime() * 0.5) * 0.5,
            0,
            Math.cos(clock.getElapsedTime() * 0.5) * 0.5
          );
          break;

        case "targeting":
          if (targetHouse) {
            moveDirection
              .set(targetHouse[0] - position.x, 0, targetHouse[2] - position.z)
              .normalize();

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
          if (Math.random() < 0.01) {
            setState("fleeing");
          }
          break;

        case "fleeing":
          moveDirection.set(position.x - -15, 0, position.z - 0).normalize();

          const distanceFromPolice = Math.sqrt(
            Math.pow(-15 - position.x, 2) + Math.pow(0 - position.z, 2)
          );

          if (distanceFromPolice > 30) {
            setTargetHouse(null);
            setState("wandering");
          }
          break;
      }

      const moveSpeed = state === "fleeing" ? 8 : 4;
      robberRef.current.setLinvel(
        {
          x: moveDirection.x * moveSpeed,
          y: 0,
          z: moveDirection.z * moveSpeed,
        },
        true
      );

      if (moveDirection.length() > 0.1) {
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        robberRef.current.setRotation(
          { x: 0, y: angle, z: 0, w: Math.cos(angle / 2) },
          true
        );
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [state, targetHouse]);

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
      <mesh castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.2]}>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh castShadow position={[0.3, 1.2, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#553311" />
      </mesh>
    </RigidBody>
  );
};

export default Robber;

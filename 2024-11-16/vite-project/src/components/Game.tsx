import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Neighborhood from "./Neighborhood"; // Assuming Neighborhood is defined in components
import Ground from "./Ground"; // Import Ground component
import Road from "./Road"; // Import Road component
import PoleWithBell from "./PoleWithBell"; // Import PoleWithBell component
import PoliceStation from "./PoliceStation"; // Import PoliceStation component
import Tree from "./Tree"; // Import Tree component
import Robber from "./Robber"; // Import Robber component
import Player from "./Player"; // Import Player component for police officer movement
import Toolbar from "./Toolbar"; // Import Toolbar component
import TransformableObject from "./TransformableObject"; // Import the TransformableObject component

const Game = () => {
  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <Canvas
        shadows
        camera={{ position: [-6, 4, -6], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
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
        <Suspense fallback={null}>
          <Physics>
            <Ground />
            <Neighborhood />
            <Road />
            <PoleWithBell />
            <PoliceStation />
            <Robber initialPosition={[0, 0, 0]} />
            <Player />
            <TransformableObject /> {/* Add the TransformableObject here */}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Game;

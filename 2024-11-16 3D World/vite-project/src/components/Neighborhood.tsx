import React from "react";
import House from "./House";
import PoleWithBell from "./PoleWithBell";
import Road from "./Road";

const Neighborhood = () => {
  return (
    <group>
      {/* Add your neighborhood elements here */}
      <House position={[0, 0, 0]} />
      <House position={[2, 0, 0]} />
      <PoleWithBell position={[1, 0, 1]} />
      <Road position={[0, 0, -1]} />
      {/* Add more elements as needed */}
    </group>
  );
};

export default Neighborhood;

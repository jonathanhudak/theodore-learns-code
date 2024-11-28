import { useEffect } from "react";
import { keys } from "../keys";

const useKeyboardControls = () => {
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
};

export default useKeyboardControls;

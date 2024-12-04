import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Outlet,
  Link,
} from "react-router-dom";
import ObjectViewer from "./ObjectViewer";
import Game from "./components/Game";
import CharacterEditor from "./components/CharacterEditor";
import SceneList from "./components/SceneList";

function Layout() {
  return (
    <div>
      <nav className="flex gap-4 p-4">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/character"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          New Scene
        </NavLink>
        <NavLink
          to="/scenes"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Saved Scenes
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index path="/" element={<Game />} />
          <Route path="/objects" element={<ObjectViewer />} />
          <Route path="/character" element={<CharacterEditor />} />
          <Route path="/scenes" element={<SceneList />} />
          <Route path="/scenes/:sceneId" element={<CharacterEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

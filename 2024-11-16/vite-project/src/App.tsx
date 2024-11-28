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

function Layout() {
  return (
    <div>
      <nav>
        {/* NavLink makes it easy to show active states */}
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <Link to="/character">Character Editor</Link>
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
        </Route>
      </Routes>
    </Router>
  );
}

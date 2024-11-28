import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Ground from "./components/Ground";
import Building from "./components/Building";
import House from "./components/House";
import Tree from "./components/Tree";
import Road from "./components/Road";
import PoleWithBell from "./components/PoleWithBell";
import PoliceStation from "./components/PoliceStation";
import Robber from "./components/Robber";
import Player from "./components/Player";

const ObjectViewer = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/ground">Ground</Link>
            </li>
            <li>
              <Link to="/building">Building</Link>
            </li>
            <li>
              <Link to="/house">House</Link>
            </li>
            <li>
              <Link to="/tree">Tree</Link>
            </li>
            <li>
              <Link to="/road">Road</Link>
            </li>
            <li>
              <Link to="/pole">PoleWithBell</Link>
            </li>
            <li>
              <Link to="/police-station">PoliceStation</Link>
            </li>
            <li>
              <Link to="/robber">Robber</Link>
            </li>
            <li>
              <Link to="/player">Player</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/ground" component={Ground} />
          <Route path="/building" component={Building} />
          <Route path="/house" component={House} />
          <Route path="/tree" component={Tree} />
          <Route path="/road" component={Road} />
          <Route path="/pole" component={PoleWithBell} />
          <Route path="/police-station" component={PoliceStation} />
          <Route path="/robber" component={Robber} />
          <Route path="/player" component={Player} />
        </Routes>
      </div>
    </Router>
  );
};

export default ObjectViewer;

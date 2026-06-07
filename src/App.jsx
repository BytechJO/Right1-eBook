import { useState } from "react";
import OrientationGate from "./component/OrientationGate";

import "./App.css";
import Book from "./component/Book";

function App() {
  return (
    <>
      <OrientationGate>
        <Book />
      </OrientationGate>
    </>
  );
}

export default App;

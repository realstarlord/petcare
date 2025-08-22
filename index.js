import React from "react";
import { createRoot } from "react-dom/client";
import PetCareGame from "./PetCareGame";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<PetCareGame />);
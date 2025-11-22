"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";

const Home = () => {
  const [show, setShow] = useState(true);

  return (
    <div className="h-full w-full">
      <Navbar />

      {show && (
        <div className="bg-yellow-200 text-yellow-900 p-3 w-full text-center text-sm flex justify-center items-center gap-3">
          <span>⚠️ In order to reduce costs, the backend may be sleeping or inactive.</span>
          <button
            className="text-yellow-900 font-semibold underline"
            onClick={() => setShow(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="h-full w-full flex flex-col">
        <Landing />
      </main>
    </div>
  );
};

export default Home;

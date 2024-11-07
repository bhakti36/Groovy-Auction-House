'use client'
import React from "react";
import  ReactDOM  from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import Home from "./pages/Home/page";
import LoginPage from "./pages/LoginPage/page";
// import ./index.css;



const router = createBrowserRouter(
    [
        { path: "/", element: <LoginPage /> },
        {}
    ]
);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router}/> 
    </React.StrictMode>
);
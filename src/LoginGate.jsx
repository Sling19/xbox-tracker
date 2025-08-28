import React, { useState, useEffect } from "react";

export default function LoginGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (localStorage.getItem("authed") === "true") {
      setAuthed(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (input === "revival123") {
      localStorage.setItem("authed", "true");
      setAuthed(true);
    } else {
      alert("Wrong password");
    }
  };

  if (!authed) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-md rounded-lg p-6 w-80 text-center"
        >
          <h2 className="text-xl font-semibold mb-4">🔒 Enter Password</h2>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            placeholder="Password"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return children;
}

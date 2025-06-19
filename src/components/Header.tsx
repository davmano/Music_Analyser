import React from 'react';
import { Link } from 'react-router-dom';
export function Header() {
  return <header className="bg-purple-700 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div size={28} />
          <h1 className="text-2xl font-bold">Track Splitter</h1>
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/split" className="text-sm hover:text-purple-200 transition-colors">
            Start Splitting
          </Link>
        </div>
      </div>
    </header>;
}
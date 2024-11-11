import React from 'react';
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

export default function TldrawWorkspace() {
  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 relative">
      <div className="absolute inset-0 p-4">
        <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
          <Tldraw />
        </div>
      </div>
    </div>
  );
}
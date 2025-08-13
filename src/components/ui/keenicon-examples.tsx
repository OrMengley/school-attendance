import React from 'react';
import { KeenIcon } from './keenicon';

/**
 * Example component showcasing how to use KeenIcon
 * This is for demonstration purposes only
 */
export const KeenIconExamples: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">KeenIcon Examples</h2>
      
      {/* Basic usage */}
      <div>
        <h3 className="font-semibold mb-2">Basic Usage:</h3>
        <div className="flex gap-4 items-center">
          <KeenIcon name="abstract-1" />
          <KeenIcon name="abstract-2" />
          <KeenIcon name="abstract-3" />
        </div>
      </div>

      {/* Different sizes */}
      <div>
        <h3 className="font-semibold mb-2">Different Sizes:</h3>
        <div className="flex gap-4 items-center">
          <KeenIcon name="abstract-1" size="xs" />
          <KeenIcon name="abstract-1" size="sm" />
          <KeenIcon name="abstract-1" size="md" />
          <KeenIcon name="abstract-1" size="lg" />
          <KeenIcon name="abstract-1" size="xl" />
          <KeenIcon name="abstract-1" size="2xl" />
        </div>
      </div>

      {/* With colors */}
      <div>
        <h3 className="font-semibold mb-2">With Custom Colors:</h3>
        <div className="flex gap-4 items-center">
          <KeenIcon name="abstract-1" className="text-blue-600" size="lg" />
          <KeenIcon name="abstract-1" className="text-red-600" size="lg" />
          <KeenIcon name="abstract-1" className="text-green-600" size="lg" />
          <KeenIcon 
            name="abstract-1" 
            size="lg"
            primaryColor="#ff6b6b" 
            secondaryColor="#4ecdc4" 
          />
        </div>
      </div>

      {/* In buttons */}
      <div>
        <h3 className="font-semibold mb-2">In Buttons:</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded">
            <KeenIcon name="abstract-1" size="sm" />
            Check In
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded">
            <KeenIcon name="abstract-2" size="sm" />
            Check Out
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h4 className="font-medium mb-2">Usage Notes:</h4>
        <ul className="text-sm space-y-1">
          <li>• Icons are duotone with a main layer and a semi-transparent overlay</li>
          <li>• Use className for basic styling (colors, margins, etc.)</li>
          <li>• Use primaryColor/secondaryColor props for custom duotone colors</li>
          <li>• Available sizes: xs, sm, md, lg, xl, 2xl, 3xl</li>
          <li>• View demo.html file for all available icon names</li>
        </ul>
      </div>
    </div>
  );
};

export default KeenIconExamples;

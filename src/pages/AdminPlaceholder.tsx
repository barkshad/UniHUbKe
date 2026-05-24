import React from 'react';

export const AdminPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium mb-2">{title}</h1>
        <p className="text-white/50">This section is currently under construction for the CMS.</p>
      </div>
      <div className="glass-panel p-10 rounded-[2rem] border border-white/10 text-center py-32 flex flex-col items-center justify-center text-white/30">
        Module not implemented in this demo phase.
      </div>
    </div>
  );
};

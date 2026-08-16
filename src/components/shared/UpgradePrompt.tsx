"use client";

import { useRouter } from "next/navigation";

interface UpgradePromptProps {
  featureName: string;
  onClose: () => void;
}

export function UpgradePrompt({ featureName, onClose }: UpgradePromptProps) {
  const router = useRouter();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <span>Feature Locked</span>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="panel-body flex flex-col items-center text-center gap-md" style={{ padding: '2rem' }}>
          <div className="badge badge-pro" style={{ fontSize: '1rem', padding: '4px 12px', marginBottom: '1rem' }}>PRO</div>
          <h3 className="font-serif text-2xl">{featureName} is a Pro feature</h3>
          <p className="text-secondary text-sm" style={{ maxWidth: '300px' }}>
            Upgrade to the Master Draftsman tier to unlock advanced features like DXF export, modifier stacks, and more.
          </p>
          
          <div className="flex gap-sm" style={{ marginTop: '1rem', width: '100%' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Maybe Later
            </button>
            <button className="btn btn-brass" style={{ flex: 1 }} onClick={() => router.push('/pricing')}>
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

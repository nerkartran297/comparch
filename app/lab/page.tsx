import type { Metadata } from 'next';
import Lab from '@/components/lab/Lab';

export const metadata: Metadata = { title: 'Lab RISC-V' };

export default function LabPage() {
  return (
    <div className="lab-page">
      <Lab />
    </div>
  );
}

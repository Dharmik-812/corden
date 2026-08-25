import { Editor3DClient } from "@/components/editor-3d/Editor3DClient";
import { Suspense } from "react";

export default async function Editor3DPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <Suspense fallback={<div style={{ padding: 20, color: '#fff' }}>Loading Editor...</div>}>
      <Editor3DClient projectId={projectId} />
    </Suspense>
  );
}

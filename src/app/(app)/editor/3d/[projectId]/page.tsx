import { Editor3DClient } from "@/components/editor-3d/Editor3DClient";

export default async function Editor3DPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <Editor3DClient projectId={projectId} />;
}

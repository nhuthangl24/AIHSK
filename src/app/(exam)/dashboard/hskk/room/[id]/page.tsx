import { HskkExamRoomClient } from "@/components/hskk/hskk-exam-room-client";

export const dynamic = "force-dynamic";

export default async function HskkExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HskkExamRoomClient sessionId={id} />;
}

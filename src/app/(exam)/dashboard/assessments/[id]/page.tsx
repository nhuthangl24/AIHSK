import AssessmentExamRoomClient from "./assessment-client";

export const dynamic = "force-dynamic";

export default async function AssessmentExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentExamRoomClient sessionId={id} />;
}

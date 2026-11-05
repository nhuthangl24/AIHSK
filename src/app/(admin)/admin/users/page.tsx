import { AdminService } from "@/lib/admin/admin-service";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const enrichedUsers = await AdminService.getEnrichedUsers();
  return <UsersClient initialUsers={enrichedUsers} />;
}

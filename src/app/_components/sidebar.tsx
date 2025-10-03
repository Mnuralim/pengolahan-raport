import { getSession } from "@/actions/session";
import { SidebarItem } from "./sidebar-item";
import { getTeacher } from "@/actions/teacher";

export async function Sidebar() {
  const session = await getSession();
  const [user] = await Promise.all([getTeacher(session?.id || "")]);
  return (
    <>
      <SidebarItem username={user?.name} />
    </>
  );
}

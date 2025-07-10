import { currentUser } from "@clerk/nextjs/server";
import CustomProfile from "../components/CustomProfile";

export default async function CustomProfilePage() {
  const user = await currentUser();
  return <CustomProfile user={user} />;
}

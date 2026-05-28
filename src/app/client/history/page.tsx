import { redirect } from "next/navigation";

// History now lives inside the merged Progress surface.
export default function ClientHistoryRedirect() {
  redirect("/client/progress");
}

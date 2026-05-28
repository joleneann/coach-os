import { redirect } from "next/navigation";

// Week reviews now live inside the merged Progress surface.
export default function ClientReviewRedirect() {
  redirect("/client/progress");
}

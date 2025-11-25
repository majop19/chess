import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

export const Page = () => {
  const { abortStatusCode } = usePageContext();

  if (abortStatusCode == 401) {
    toast.error("You must be logged in to access this page.");
    navigate("/auth/login", {
      pageContext: { loginAccessError: true },
    });
    return;
  }
  if (abortStatusCode == 403) {
    toast.error("You do not have permission to access this page.");
    navigate("/", {
      pageContext: {
        forbiddenAccessError: true,
      },
    });
  }
};

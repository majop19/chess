import PrismaticBurst from "#frontx/components/PrismaticBurst";
import { Button } from "#frontx/components/ui/button";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

const Page = () => {
  // @ts-expect-error -- fix type
  const { user, forbiddenAccessError } = usePageContext();

  if (forbiddenAccessError) {
    toast.error("You do not have permission to access this page.");
  }
  return (
    <div className="w-full h-full fixed">
      <PrismaticBurst
        animationType="rotate"
        intensity={3}
        speed={0.5}
        distort={0}
        paused={false}
      />
      <div className="w-full h-full flex flex-col items-center justify-center absolute top-0 left-0">
        <h1 className="text-4xl font-bold text-center">
          Welcome to My ChessGame
        </h1>
        {user == null ? (
          <Button variant="outline" className="mt-5 w-md h-8 text-md font-bold">
            Login To Play
          </Button>
        ) : null}
        <div className="flex justify-evenly gap-4 my-10 w-1/4">
          <Button
            className="w-1/3 h-12 text-lg"
            onClick={() => navigate("/game")}
          >
            Play Games
          </Button>
          <Button
            className="w-1/3 h-12 text-lg"
            onClick={() => navigate("/puzzles")}
            variant="secondary"
          >
            Solve Problems
          </Button>
        </div>
        <h2 className="text-3xl font-bold text-center">Have Fun!</h2>
      </div>
    </div>
  );
};

export { Page };

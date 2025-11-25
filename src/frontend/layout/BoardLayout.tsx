import { useBoardSize } from "#front/hooks/use-BoardSize";
import clsx from "clsx";
import { ReactNode } from "react";

export const BoardLayout = ({ children }: { children: ReactNode }) => {
  const BoardSize = useBoardSize();
  return (
    <>
      <div className="w-full h-screen bg-background">
        <div
          className={clsx(
            "h-full flex justify-center items-center relative ",
            BoardSize === 6
              ? "w-[length:calc(100vw+3rem-(6*(100vh/10)))]"
              : BoardSize === 4
              ? "w-[length:calc(100vw+3rem-(4*(100vh/10)))]"
              : BoardSize === 2
              ? "w-[length:calc(100vw-(2*(100vh/10)))]"
              : "w-full right-[-3rem]"
          )}
        >
          {children}
        </div>
        <div className="absolute right-0 top-0 h-screen flex ml-auto">
          {new Array(BoardSize).fill(0).map((_, i) => {
            return (
              <div key={i}>
                {new Array(10).fill(0).map((_, j) => {
                  return (
                    <div
                      className={clsx(
                        "size-[length:calc(100vh/10)]",
                        i % 2 == 0
                          ? j % 2 == 0
                            ? "bg-primary"
                            : "bg-secondary"
                          : j % 2 == 0
                          ? "bg-secondary"
                          : "bg-primary"
                      )}
                      key={j}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

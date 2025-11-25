import { Button } from "#frontx/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#frontx/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#frontx/components/ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { navigate, reload } from "vike/client/router";

export const Page = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  // @ts-expect-error -- fix type
  const { user } = usePageContext();

  const mutation = useMutation({
    mutationFn: async (code: string) => {
      return axios
        .post("http://localhost:3000/auth/verify-email", { code: code })
        .then(() => navigate("/"))
        .catch((error) => {
          if (!error.response.data.invalid) setIsTokenExpired(true);
          throw new Error(error.response.data.message);
        });
    },
  });

  const ResendEmail = async () => {
    await axios
      .post("http://localhost:3000/auth/resend-email", {
        email: user?.email,
      })
      .catch(() => toast.error("An Error occured"));
    await reload();
  };

  if (isTokenExpired) {
    return (
      <Card className="w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Your token has expired
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Click to receive a new token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={async () => {
              await ResendEmail();
            }}
          >
            Resend
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-md">
      <CardHeader className="text-center text-3xl">
        <CardTitle>Verify your Email</CardTitle>
        <CardDescription>I sent a code to {user?.email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-2">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={inputValue}
          onChange={(value) => setInputValue(value)}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-11 m-1 rounded-md"
                autoFocus={i === 0}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          className="w-full"
          disabled={inputValue.length != 6}
          onClick={() => mutation.mutate(inputValue)}
        >
          Verify
        </Button>
        {mutation.error ? (
          <p className="font-semibold text-destructive m-auto">
            {mutation.error.message}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center font-medium">
        <p>
          Didn't recieve an email?{" "}
          <a className="font-bold underline-offset-2 underline hover:text-primary cursor-pointer">
            Resend
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

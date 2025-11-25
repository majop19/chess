import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "#frontx/components/ui/form";
import { Input } from "#frontx/components/ui/input";
import { Button } from "#frontx/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#frontx/components/ui/card";
import { cn } from "../../../frontend/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { navigate } from "vike/client/router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { toast } from "sonner";

const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type FormSchemaType = z.infer<typeof LoginFormSchema>;

export const Page = () => {
  // @ts-expect-error -- fix type
  const { loginAccessError } = usePageContext();

  if (loginAccessError) {
    toast.error("You must be logged in to access this page.");
  }
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSchemaType) => {
      return axios
        .post(`http://localhost:3000/auth/login`, values)
        .then(async (response) => {
          if (response.status === 200) {
            await navigate("/");
          }
        })
        .catch((error) => {
          throw new Error(error.response.data.message);
        });
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    mutation.mutate(values);
  };

  return (
    <Card
      className={cn(mutation.isPending ? "opacity-50" : null, "w-md relative")}
    >
      <CardHeader className="text-center text-3xl">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-lg">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={mutation.isPending}
                      placeholder="Email"
                      type="email"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex">
                    <FormLabel className="font-semibold text-lg">
                      Password
                    </FormLabel>

                    <a
                      href="/auth/forgot-password"
                      className="ml-auto text-primary font-medium hover:scale-103 hover:underline text-sm mt-1.5"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={mutation.isPending}
                      placeholder="Password"
                      type={showPassword ? undefined : "password"}
                    />
                  </FormControl>
                  <Button
                    className="w-fit absolute right-5 top-55"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((curr) => !curr);
                    }}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="pt-3 w-96 text-md mt-2"
              disabled={mutation.isPending}
            >
              Submit
            </Button>
          </form>
        </Form>
        {mutation.error ? (
          <p className="font-semibold text-destructive m-auto text-lg">
            {mutation.error.message}
          </p>
        ) : null}
        <div className="relative text-center text-md after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-2">
          <span className="relative z-10 bg-card px-2 text-foreground font-medium">
            Or Continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={mutation.isPending}
          onClick={async () => {
            await navigate("/auth/google");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="24"
            height="24"
            viewBox="0 0 72 72"
            fill="currentColor"
          >
            <path d="M36.005,31.774l22.623,0.032C60.603,41.161,56.993,60,36.005,60C22.748,60,12,49.255,12,36s10.748-24,24.005-24	c6.227,0,11.899,2.371,16.164,6.257l-6.755,6.753c-2.532-2.169-5.813-3.487-9.409-3.487c-7.996,0-14.48,6.481-14.48,14.476	s6.482,14.476,14.48,14.476c6.716,0,11.359-3.975,13.067-9.532H36.005V31.774z"></path>
          </svg>
          Login with Google
        </Button>
        <p className="m-auto pt-2 font-medium">
          Don't have an account?
          <a
            href="/auth/register"
            className="font-bold underline-offset-2 underline hover:text-primary pl-0.5"
          >
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

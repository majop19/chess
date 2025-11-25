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
import { useState } from "react";
import { cn } from "../../../frontend/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import PasswordStrengthMeter from "#frontx/components/auth/passwordStrenthMeter";
import { navigate } from "vike/client/router";
import { toast } from "sonner";

const LoginFormSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.string().email(),
  password: z
    .string()
    .min(7, "Password must include at least 7 characters")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Password must include at least one uppercase letter."
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Password must include at least one lowercase letter."
    )
    .refine(
      (password) => /[0-9]/.test(password),
      "Password must include at least one number."
    )
    .refine(
      (password) => /[^A-Za-z0-9]/.test(password),
      "Password must include at least one special character."
    ),
});

type FormSchemaType = z.infer<typeof LoginFormSchema>;

export const Page = () => {
  const [passwordStrenth, setPasswordStrenth] = useState("");
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
  });
  const mutation = useMutation({
    mutationFn: async (values: FormSchemaType) => {
      return axios
        .post(`http://localhost:3000/auth/register`, values)
        .then(async (response) => {
          if (response.status === 201) {
            await navigate("/auth/verify-email");
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("An error occurred while creating your account.");
          throw new Error(error.response.data.message);
        });
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    mutation.mutate(values);
  };

  return (
    <Card className={cn(mutation.isPending ? "opacity-50" : null, "w-md")}>
      <CardHeader className="text-center text-3xl">
        <CardTitle>Signup</CardTitle>
        <CardDescription>
          Fill in the details below to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-lg">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={mutation.isPending}
                      placeholder="Name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                  <FormLabel className="font-semibold text-lg">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={mutation.isPending}
                      placeholder="Password"
                      onChange={(e) => {
                        field.onChange(e);
                        setPasswordStrenth(e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <PasswordStrengthMeter password={passwordStrenth} />
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
          <p className="font-semibold text-destructive m-auto">
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
          Signup with Google
        </Button>
      </CardContent>
    </Card>
  );
};

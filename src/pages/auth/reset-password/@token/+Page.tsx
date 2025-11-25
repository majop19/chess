import PasswordStrengthMeter from "#frontx/components/auth/passwordStrenthMeter";
import { Button } from "#frontx/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#frontx/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#frontx/components/ui/form";
import { Input } from "#frontx/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  newPassword: z
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
  confirmPassword: z.string(),
});

type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;

export const Page = () => {
  const pageContext = usePageContext();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrenth, setPasswordStrenth] = useState("");
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (value: ForgotPasswordSchemaType) => {
      return axios
        .post(
          `http://localhost:3000/auth/reset-password/${pageContext.routeParams.token}`,
          value
        )
        .then(async (response) => {
          if (response.status === 200) {
            toast.success("Your password has been reset.");
            await navigate("/auth/login");
          }
        })
        .catch((error) => {
          console.log("error");
          throw new Error(error.response.data.message);
        });
    },
  });

  const onSubmit = (value: ForgotPasswordSchemaType) => {
    mutation.mutate(value);
  };

  return (
    <Card className="w-md relative">
      <CardHeader className="text-center text-3xl">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password to reset your password.
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="font-semibold text-lg">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="New Password"
                        required
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordStrenth(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="font-semibold text-lg">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm Password"
                        type={!showPassword ? "password" : "text"}
                        required
                        {...field}
                      />
                    </FormControl>
                    <Button
                      className="w-fit absolute right-12 top-55"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword((curr) => !curr);
                      }}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PasswordStrengthMeter password={passwordStrenth} />
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          </Form>
          {mutation.error ? (
            <p className="font-semibold text-destructive m-auto text-lg">
              {mutation.error.message}
            </p>
          ) : null}
        </CardContent>
      </CardHeader>
    </Card>
  );
};

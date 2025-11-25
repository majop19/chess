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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ForgotPasswordSchema = z.object({ email: z.string().email() });

type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;

export const Page = () => {
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (value: ForgotPasswordSchemaType) => {
      return axios
        .post("http://localhost:3000/auth/forgot-password", value)
        .catch(() => toast.error("An error occured."));
    },
  });

  const onSubmit = (value: ForgotPasswordSchemaType) => {
    mutation.mutate(value);
  };

  return (
    <Card className="w-md">
      <CardHeader className="text-center text-3xl">
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="font-semibold text-lg">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Email" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>
          </Form>
          {mutation.isSuccess ? (
            <p className="text-lg mt-2 font-medium text-primary">
              An email has been sent with a reset link
            </p>
          ) : null}
        </CardContent>
      </CardHeader>
    </Card>
  );
};

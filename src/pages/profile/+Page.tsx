import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#frontx/components/ui/form";
import { Input } from "#frontx/components/ui/input";
import { Button } from "#frontx/components/ui/button";

import { useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#frontx/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import FormData from "form-data";
import { toast } from "sonner";
import { reload } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const formSchema = z.object({
  name: z.string().min(3).max(20).optional().or(z.literal("")),
  image: z.optional(
    z
      .instanceof(File, {
        message: "Please select an image file.",
      })
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: `The image is too large. Please choose an image smaller than ${formatBytes(
          MAX_FILE_SIZE
        )}.`,
      })
      .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Please upload a valid image file (JPEG, JPG , PNG or Webp).",
      })
  ),
});

type FormType = z.infer<typeof formSchema>;

export const Page = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pageContext = usePageContext();

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const handleReset = () => {
    // Réinitialiser le formulaire
    form.reset();

    // Réinitialiser manuellement l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Efface la valeur de l'input
    }
  };

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return axios
        .post("http://localhost:3000/profile/avatar", form, {
          headers: form.getHeaders?.() ?? {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async () => await reload())
        .catch((error) => {
          console.log(error);
          throw new Error(error.message);
        });
    },
  });

  const onSubmit = async (values: FormType) => {
    if (values.image) {
      toast.promise(mutation.mutateAsync(values.image), {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (error) => `${error}`,
      });
      handleReset();
    }
  };
  // @ts-expect-error -- fix type
  if (!pageContext.user) return;
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Card className="w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                        ref={fileInputRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <Button type="submit" className="cursor-pointer">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

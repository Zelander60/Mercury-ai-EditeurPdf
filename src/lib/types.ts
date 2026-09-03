import { z } from 'zod';

export const FormSchema = z.object({
  email: z.string().describe('Email').email({ message: 'Invalid Email' }),
  password: z.string().describe('Password').min(1, { message: 'Password is required' }),
});

export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe('Workspace Name')
    .min(1, { message: 'Workspace name must be min of 1 character' }),
  logo: z.any(),
});

export const UploadBannerFormSchema = z.object({
  banner: z
    .any()
    .refine((f) => f?.[0] instanceof File, 'Banner image is required')
    .refine((f) => f?.[0]?.size < 4_000_000, 'Max 4MB')
    .refine((f) => f?.[0]?.type?.startsWith('image/'), 'Image only'),
});

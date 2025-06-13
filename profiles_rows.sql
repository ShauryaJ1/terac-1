-- Add profile_text column to profiles table
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "profile_text" TEXT;

INSERT INTO "public"."profiles" ("id", "user_id", "name", "email", "created_at", "updated_at") VALUES ('39f6efcc-c447-4853-a1ff-ab46097d7280', '39f6efcc-c447-4853-a1ff-ab46097d7280', 'dude', 'shaurya.s.jain@gmail.com', '2025-06-12 00:05:19.554704+00', '2025-06-12 00:07:50.105784+00');
"use server";

import { hashUserPassword } from "@/lib/hash";
import { CreateUser } from "@/lib/user";
import { redirect } from "next/navigation";

export async function SignUp(prevState, formdata) {
  const email = formdata.get("email");
  const password = formdata.get("password");

  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter valid email address";
  }
  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  const hashedPassword = hashUserPassword(password);
  try {
    CreateUser(email, hashedPassword);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "Email already exists",
        },
      };
    }
    throw error;
  }
  redirect("/training");
}

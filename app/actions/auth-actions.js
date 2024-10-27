"use server";

import { CreateAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { CreateUser, GetUserByEmail } from "@/lib/user";
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
    const id = CreateUser(email, hashedPassword);
    await CreateAuthSession(id);
    redirect("/training");
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
}

export async function login(prevState, formdata) {
  const email = formdata.get("email");
  const password = formdata.get("password");

  const existingUser = GetUserByEmail(email);
  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user, please check your credentials",
      },
    };
  }
  const isvalidPassword = verifyPassword(existingUser.password, password);
  if (!isvalidPassword) {
    return {
      errors: {
        password: "Could not authenticate user, please check your credentials",
      },
    };
  }
  await CreateAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formdata) {
  if (mode === "login") {
    return login(prevState, formdata);
  }
  return SignUp(prevState, formdata);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export async function POST(req) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Create user in database
      await db.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0]?.email_address || `user-${id}@temp.local`,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || "User",
        },
      });

      console.log("User created successfully:", id);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Update user in database
      await db.user.update({
        where: { clerkUserId: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
        },
      });

      console.log("User updated successfully:", id);
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error updating user", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      // Delete user and all related data
      await db.$transaction(async (tx) => {
        // Delete transactions
        await tx.transaction.deleteMany({
          where: { user: { clerkUserId: id } },
        });

        // Delete accounts
        await tx.account.deleteMany({
          where: { user: { clerkUserId: id } },
        });

        // Delete budgets
        await tx.budget.deleteMany({
          where: { user: { clerkUserId: id } },
        });

        // Delete user
        await tx.user.delete({
          where: { clerkUserId: id },
        });
      });

      console.log("User deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error deleting user", {
        status: 500,
      });
    }
  }

  return new Response("", { status: 200 });
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCredits } from "@/lib/credits"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const credits = await getCredits(session.user.email)
  return NextResponse.json({ credits })
}

import Link from "next/link";
import SignIn from "./sign-in";
import NavBar from "./navbar";
import { auth } from "@/auth";
import SignOut from "./sign-out";

export default async function Header() {
    const session = await auth();

    return (
        <header className="bg-primary text-primary-foreground flex justify-between p-4">
            <h1 className="text-3xl">
                <Link href="/">MovieStore</Link>
            </h1>
            {session?.user?.name}
            {session?.user ? <SignOut></SignOut> : <SignIn></SignIn>}
            <NavBar></NavBar>
        </header>
    );
}

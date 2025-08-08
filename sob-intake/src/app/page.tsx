import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-sob-ink">School of Bots — Client Onboarding</h1>
        <p className="mt-4 text-sob-ink/70 text-base md:text-lg">
          Set up your AI-powered Instagram DM funnel. It takes ~10–15 minutes and you can save or revisit later.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center mt-8 rounded-lg bg-sob-ink text-white px-6 py-3 text-base font-medium hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sob-accent"
        >
          Start Onboarding
        </Link>
      </div>
    </main>
  );
}

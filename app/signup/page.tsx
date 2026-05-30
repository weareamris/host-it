import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-[#0b1220]/90 p-10 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Create account</p>
            <h1 className="mt-4 text-4xl font-black text-white">Sign up for Host It</h1>
            <p className="mt-4 text-slate-300">Use promo code <strong>amris001</strong> at signup to receive free creator access.</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}

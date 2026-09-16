import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-6">
        <p className="text-sm font-medium text-muted-foreground">
          Fullstack starter
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your next project starts here.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A fresh foundation, ready for your ideas.
        </p>
        <Button
          nativeButton={false}
          render={<a href="https://nextjs.org/docs" />}
        >
          Open documentation
        </Button>
      </div>
    </main>
  );
}

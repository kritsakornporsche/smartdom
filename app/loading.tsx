export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
        </div>
        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground animate-pulse">
          Crafting Experience
        </p>
      </div>
    </div>
  );
}

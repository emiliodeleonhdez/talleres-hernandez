export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Page content</h1>
      <p className="text-muted-foreground text-sm">
        This area scrolls. The header and sidebar stay fixed.
      </p>
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="h-10 rounded-md bg-muted flex items-center px-3 text-sm text-muted-foreground"
        >
          Row {i + 1}
        </div>
      ))}
    </div>
  )
}

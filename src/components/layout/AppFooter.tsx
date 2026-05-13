export function AppFooter() {
  return (
    <footer
      data-slot="app-footer"
      className="flex md:hidden h-14 shrink-0 items-center justify-around border-t border-border bg-background"
    >
      <span className="text-xs text-muted-foreground">Footer</span>
    </footer>
  )
}

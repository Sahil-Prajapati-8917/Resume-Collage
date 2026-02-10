import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    FileText,
    Search,
    ClipboardList,
    History,
    ShieldCheck,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative inline-flex items-center justify-start w-full max-w-sm px-4 py-2 text-sm font-normal transition-colors border rounded-md bg-muted/50 hover:bg-muted text-muted-foreground border-border/50 md:w-64"
            >
                <Search className="w-4 h-4 mr-2" />
                <span>Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2.0 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/upload"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Resumes</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/results"))}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            <span>Evaluations</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/prompts"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Prompts</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/audit"))}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Audit Trail</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

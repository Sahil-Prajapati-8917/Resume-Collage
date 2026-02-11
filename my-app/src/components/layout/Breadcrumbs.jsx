import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function dynamicBreadcrumbs(pathname) {
    const paths = pathname.split("/").filter(Boolean)
    const breadcrumbs = paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
        return { href, label }
    })
    return breadcrumbs
}

export function AppBreadcrumbs() {
    const location = useLocation()
    const breadcrumbs = dynamicBreadcrumbs(location.pathname)

    if (location.pathname === "/dashboard") return null

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/dashboard">
                            <Home className="h-4 w-4" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            {index === breadcrumbs.length - 1 ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={crumb.href}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

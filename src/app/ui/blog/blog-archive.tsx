"use client"

import * as React from "react"
import { useInView } from "react-intersection-observer"
import { ChevronRight, Clock, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for blog posts
const CATEGORIES = [
    { name: "Technology", count: 24 },
    { name: "Design", count: 18 },
    { name: "Business", count: 12 },
    { name: "Marketing", count: 9 },
    { name: "Development", count: 15 },
]

const POPULAR_POSTS = [
    { title: "10 Tips for Better React Performance", date: "Mar 15, 2024" },
    { title: "Understanding TypeScript Generics", date: "Mar 10, 2024" },
    { title: "The Future of Web Development", date: "Mar 5, 2024" },
    { title: "Building Accessible UIs", date: "Feb 28, 2024" },
]

const TAGS = [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "CSS",
    "Tailwind",
    "UI/UX",
    "Performance",
    "Accessibility",
    "Design Systems",
]

// Generate mock blog posts
const generateMockPosts = (page: number) => {
    return Array.from({ length: 6 }, (_, i) => ({
        id: `${page}-${i}`,
        title: `Blog Post Title ${page * 6 + i + 1}`,
        excerpt:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        readTime: Math.floor(Math.random() * 10) + 5,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].name,
        image: `/blog/${page < 2 ? (page * 6) + i + 1 : i + 1}.png`,
    }))
}

export default function BlogArchive() {
    const [posts, setPosts] = React.useState(generateMockPosts(0))
    const [page, setPage] = React.useState(1)
    const [loading, setLoading] = React.useState(false)
    const [hasMore, setHasMore] = React.useState(true)

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    })

    // Load more posts when the sentinel comes into view
    React.useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMorePosts()
        }
    }, [inView, hasMore, loading])

    const loadMorePosts = async () => {
        setLoading(true)

        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const newPosts = generateMockPosts(page)
        setPosts((prev) => [...prev, ...newPosts])
        setPage((prev) => prev + 1)

        // Stop after 5 pages for demo purposes
        if (page >= 4) {
            setHasMore(false)
        }

        setLoading(false)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8 md:flex-row">
                {/* Main content */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Blog Archive</h1>
                        <p className="mt-2 text-muted-foreground">Explore our latest articles, tutorials, and insights</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden">
                                <div className="aspect-video w-full overflow-hidden">
                                    <img
                                        src={post.image || "/1.jpg"}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-primary">{post.category}</span>
                                        <span>•</span>
                                        <span>{post.date}</span>
                                    </div>
                                    <CardTitle className="line-clamp-2 mt-2 text-xl">
                                        <a href="#" className="hover:text-primary hover:underline">
                                            {post.title}
                                        </a>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">{post.excerpt}</CardDescription>
                                </CardHeader>
                                <CardFooter className="flex items-center p-4 pt-0 text-sm text-muted-foreground">
                                    <Clock className="mr-1 h-4 w-4" />
                                    <span>{post.readTime} min read</span>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Loading indicator */}
                    {loading && (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={`skeleton-${i}`} className="overflow-hidden">
                                    <Skeleton className="aspect-video w-full" />
                                    <CardHeader className="p-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="mt-2 h-6 w-full" />
                                        <Skeleton className="mt-2 h-4 w-full" />
                                        <Skeleton className="mt-1 h-4 w-3/4" />
                                    </CardHeader>
                                    <CardFooter className="p-4 pt-0">
                                        <Skeleton className="h-4 w-24" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Sentinel element for infinite scroll */}
                    {hasMore && <div ref={ref} className="h-4 w-full" />}

                    {/* End of content message */}
                    {!hasMore && (
                        <div className="mt-10 text-center">
                            <p className="text-muted-foreground">You&apos;ve reached the end of the blog archive</p>
                            <Button variant="outline" className="mt-4">
                                Back to top
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-80 lg:w-96">
                    <div className=" top-8 space-y-8">
                        {/* Search */}
                        <Card className="sticky top-20">
                            <CardHeader className="pb-2">
                                <CardTitle>Search</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="search" placeholder="Search articles..." className="pl-8" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <ul className="divide-y">
                                    {CATEGORIES.map((category) => (
                                        <li key={category.name}>
                                            <a href="#" className="flex items-center justify-between px-6 py-3 text-sm hover:bg-muted/50">
                                                <span>{category.name}</span>
                                                <span className="flex items-center text-muted-foreground">
                                                    <span className="mr-1 text-xs">{category.count}</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Popular Posts */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Popular Posts</CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <ul className="divide-y">
                                    {POPULAR_POSTS.map((post, index) => (
                                        <li key={index}>
                                            <a href="#" className="block px-6 py-3 hover:bg-muted/50">
                                                <h3 className="line-clamp-2 text-sm font-medium">{post.title}</h3>
                                                <p className="mt-1 text-xs text-muted-foreground">{post.date}</p>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map((tag) => (
                                        <a
                                            key={tag}
                                            href="#"
                                            className="inline-flex items-center rounded-md border bg-background px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            {tag}
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}


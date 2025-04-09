"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Image, Package, ShoppingCart } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Button className="hidden sm:flex">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="showrooms" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Showrooms</span>
                    </TabsTrigger>
                    <TabsTrigger value="assets" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>Assets</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab Content */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24</div>
                                <p className="text-xs text-muted-foreground">+8% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">7</div>
                                <p className="text-xs text-muted-foreground">+2 since yesterday</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <rect width="20" height="14" x="2" y="5" rx="2" />
                                    <path d="M2 10h20" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">17</div>
                                <p className="text-xs text-muted-foreground">+12% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">42</div>
                                <p className="text-xs text-muted-foreground">+18% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Ongoing Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="space-y-4">
                                    {/* Order 1 */}
                                    <div className="flex items-center border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-r-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Order #1234</p>
                                            <p className="text-sm text-muted-foreground">3D Model Rendering</p>
                                        </div>
                                        <Badge className="bg-blue-500">In Progress</Badge>
                                    </div>

                                    {/* Order 2 */}
                                    <div className="flex items-center border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-r-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Order #1235</p>
                                            <p className="text-sm text-muted-foreground">Product Photography</p>
                                        </div>
                                        <Badge className="bg-yellow-500">Pending Approval</Badge>
                                    </div>

                                    {/* Order 3 */}
                                    <div className="flex items-center border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950/20 rounded-r-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Order #1236</p>
                                            <p className="text-sm text-muted-foreground">Virtual Showroom Setup</p>
                                        </div>
                                        <Badge className="bg-green-500">Ready for Review</Badge>
                                    </div>

                                    {/* Order 4 */}
                                    <div className="flex items-center border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-950/20 rounded-r-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Order #1237</p>
                                            <p className="text-sm text-muted-foreground">AR Experience Development</p>
                                        </div>
                                        <Badge className="bg-purple-500">Just Started</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">New order received</p>
                                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                className="h-5 w-5"
                                            >
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Order #1234 completed</p>
                                            <p className="text-xs text-muted-foreground">Yesterday</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                                            <Image className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">New assets uploaded</p>
                                            <p className="text-xs text-muted-foreground">3 days ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Showrooms Tab Content */}
                <TabsContent value="showrooms" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-full">
                            <CardHeader>
                                <CardTitle>Your Showrooms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {/* User's Showroom 1 */}
                                    <div className="relative group overflow-hidden rounded-lg border">
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            <img
                                                src="/placeholder.svg?height=200&width=300"
                                                alt="Showroom preview"
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm">
                                                    View Showroom
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium">Modern Living Room</h3>
                                            <p className="text-sm text-muted-foreground">Created 2 weeks ago</p>
                                        </div>
                                    </div>

                                    {/* User's Showroom 2 */}
                                    <div className="relative group overflow-hidden rounded-lg border">
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            <img
                                                src="/placeholder.svg?height=200&width=300"
                                                alt="Showroom preview"
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm">
                                                    View Showroom
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium">Minimalist Kitchen</h3>
                                            <p className="text-sm text-muted-foreground">Created 1 month ago</p>
                                        </div>
                                    </div>

                                    {/* Create New Showroom Card */}
                                    <div className="flex items-center justify-center rounded-lg border border-dashed h-full min-h-[200px]">
                                        <Button variant="outline" className="flex flex-col h-24 w-40 items-center justify-center">
                                            <PlusCircle className="h-8 w-8 mb-2" />
                                            <span>Create New Showroom</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Community Showrooms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* Community Showroom 1 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=250"
                                            alt="Showroom preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium">Industrial Office</h3>
                                        <p className="text-xs text-muted-foreground">By Alex Johnson</p>
                                    </div>
                                </div>

                                {/* Community Showroom 2 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=250"
                                            alt="Showroom preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium">Coastal Bedroom</h3>
                                        <p className="text-xs text-muted-foreground">By Maria Garcia</p>
                                    </div>
                                </div>

                                {/* Community Showroom 3 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=250"
                                            alt="Showroom preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium">Urban Loft</h3>
                                        <p className="text-xs text-muted-foreground">By David Kim</p>
                                    </div>
                                </div>

                                {/* Community Showroom 4 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=250"
                                            alt="Showroom preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium">Scandinavian Dining</h3>
                                        <p className="text-xs text-muted-foreground">By Emma Wilson</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Assets Tab Content */}
                <TabsContent value="assets" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Your Assets</h3>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Upload New Asset
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Asset Categories */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">3D Models</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="mr-1 h-3 w-3 text-emerald-500"
                                    >
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                    <span>+2 this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">36</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="mr-1 h-3 w-3 text-emerald-500"
                                    >
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                    <span>+8 this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="mr-1 h-3 w-3 text-emerald-500"
                                    >
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                    <span>+1 this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">AR Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">8</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="mr-1 h-3 w-3 text-emerald-500"
                                    >
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                    <span>+3 this month</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                                {/* Asset 1 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=150"
                                            alt="Asset preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium truncate">Modern Chair</h3>
                                        <p className="text-xs text-muted-foreground">3D Model</p>
                                    </div>
                                </div>

                                {/* Asset 2 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=150"
                                            alt="Asset preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium truncate">Dining Table</h3>
                                        <p className="text-xs text-muted-foreground">3D Model</p>
                                    </div>
                                </div>

                                {/* Asset 3 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=150"
                                            alt="Asset preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium truncate">Pendant Light</h3>
                                        <p className="text-xs text-muted-foreground">Image</p>
                                    </div>
                                </div>

                                {/* Asset 4 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=150"
                                            alt="Asset preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium truncate">Sofa Set</h3>
                                        <p className="text-xs text-muted-foreground">AR Asset</p>
                                    </div>
                                </div>

                                {/* Asset 5 */}
                                <div className="relative group overflow-hidden rounded-lg border">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src="/placeholder.svg?height=150&width=150"
                                            alt="Asset preview"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium truncate">Room Tour</h3>
                                        <p className="text-xs text-muted-foreground">Video</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

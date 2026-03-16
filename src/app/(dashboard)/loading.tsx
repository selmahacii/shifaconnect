
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm h-[350px]">
               <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
               <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
            </Card>
            <Card className="border-none shadow-sm h-[350px]">
               <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
               <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
             <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
             <CardContent className="space-y-4">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex gap-3">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-3 w-24" />
                   </div>
                 </div>
               ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

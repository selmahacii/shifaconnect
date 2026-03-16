
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-[#1B4F72]/10 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-44" />
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-t">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="border-b flex gap-8">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}

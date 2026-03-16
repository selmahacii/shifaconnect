
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      
      <div className="flex gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-[180px]" />
        <Skeleton className="h-11 w-[180px]" />
      </div>

      <div className="bg-white rounded-xl border p-1">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

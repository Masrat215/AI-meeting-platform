   import { toast } from "sonner";
   import Button from "../components/ui/Button";
   import Card from "../components/ui/Card";
   import Skeleton from "../components/ui/Skeleton";
   import EmptyState from "../components/ui/EmptyState";

   function DesignPreview() {
     return (
       <div className="space-y-5">
         <h1>Design preview</h1>

         <Card>
           <h2>Buttons</h2>
           <div className="flex flex-wrap gap-3">
             <Button>Primary</Button>
             <Button variant="secondary">Secondary</Button>
             <Button variant="danger">Danger</Button>
             <Button variant="ghost">Ghost</Button>
             <Button disabled>Disabled</Button>
           </div>
         </Card>

         <Card>
           <h2>Toast messages</h2>
           <div className="flex flex-wrap gap-3">
             <Button onClick={() => toast.success("Meeting uploaded")}>
               Success toast
             </Button>
             <Button
               variant="secondary"
               onClick={() => toast.error("Something went wrong")}
             >
               Error toast
             </Button>
           </div>
         </Card>

         <Card>
           <h2>Loading placeholders</h2>
           <div className="space-y-3">
             <Skeleton className="h-5 w-1/3" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-5/6" />
           </div>
         </Card>

         <EmptyState
           title="Nothing here yet"
           message="This is how an empty list will look in ScribWave."
           action={<Button>Do something</Button>}
         />
       </div>
     );
   }

   export default DesignPreview;
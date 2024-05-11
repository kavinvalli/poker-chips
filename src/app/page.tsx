import CreateRoomForm from "@/components/CreateRoomForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create room</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateRoomForm />
        </CardContent>
      </Card>
    </div>
  );
}

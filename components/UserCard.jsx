import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserCard({ user }) {
  return (
    <div>
      <Card className="">
        <CardHeader>
          <div className="flex-col space-y-2 mb-3">
            <div className="flex-col items-center gap-6 space-y-3">
              <CardTitle className="">
                <div className="w-56">{user.username}</div>
              </CardTitle>
              <Badge>{user.role}</Badge>
            </div>
            <div>
              <CardDescription className="mt-4">
                This user has created {user.lists.length} lists.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

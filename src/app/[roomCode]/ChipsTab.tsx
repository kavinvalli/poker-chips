import { users } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChipsTabProps {
  users: InferSelectModel<typeof users>[];
}

export default function ChipsTab({ users }: ChipsTabProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Chips</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.chips}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

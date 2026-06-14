"use client";

import {
  LockIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserDialog } from "@/components/usuarios/user-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getInitials } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import { ROLE_LABELS, type User } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

function RoleBadge({ role }: { role: User["role"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-transparent font-mono text-2xs uppercase tracking-widest",
        role === "SUPERADMIN"
          ? "bg-gold/15 text-gold"
          : "bg-muted text-muted-foreground",
      )}
    >
      {role === "SUPERADMIN" ? (
        <ShieldIcon className="size-3" />
      ) : (
        <UserIcon className="size-3" />
      )}
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export default function UsuariosPage() {
  const { users, currentUser, isSuperadmin, deleteUser } = useMockData();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  if (!isSuperadmin) {
    return (
      <div className="p-6">
        <EmptyState
          icon={LockIcon}
          title="Acceso restringido"
          description="Solo los superadmins pueden gestionar usuarios."
        />
      </div>
    );
  }

  function handleDelete() {
    if (!deleting) return;
    const result = deleteUser(deleting.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Usuario eliminado");
    setDeleting(null);
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} usuarios registrados`}
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-brand hover:bg-brand/90"
          >
            <PlusIcon className="size-4" /> Nuevo usuario
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Sin usuarios"
          description="Crea el primer usuario del sistema."
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card p-3.5",
                  user.id === currentUser.id
                    ? "border-gold/40"
                    : "border-border",
                )}
              >
                <Avatar>
                  <AvatarFallback className="bg-sub-nav-bg text-xs font-semibold text-brand">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{user.fullName}</span>
                    {user.id === currentUser.id && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-transparent bg-gold/15 font-mono text-2xs text-gold"
                      >
                        Tú
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(user)}
                    aria-label={`Editar ${user.fullName}`}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-cancelled-fg"
                    onClick={() => setDeleting(user)}
                    disabled={user.id === currentUser.id}
                    aria-label={`Eliminar ${user.fullName}`}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      user.id === currentUser.id && "bg-gold/5",
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-sub-nav-bg text-xs font-semibold text-brand">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.fullName}</span>
                          {user.id === currentUser.id && (
                            <span className="font-mono text-2xs text-gold">
                              sesión activa
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(user)}
                          aria-label={`Editar ${user.fullName}`}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-cancelled-fg"
                          onClick={() => setDeleting(user)}
                          disabled={user.id === currentUser.id}
                          aria-label={`Eliminar ${user.fullName}`}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <UserDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <UserDialog
          key={editing.id}
          user={editing}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        />
      )}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a {deleting?.fullName}. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
